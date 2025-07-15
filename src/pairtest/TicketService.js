

import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */


  purchaseTickets(accountId, ...ticketTypeRequests ) {
    //  Validate the accountId which must be greater than 0 and must be integer
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Invalid accountId.');
    }

    let totalAmount = 0;
    let totalSeats = 0;
    let totalTickets = 0;
    let hasAdult = false;
    let numInfants = 0;
    let numAdults = 0;
    let totalChild = 0

    // Multiple tickets can be purchased at any given time.
    ticketTypeRequests.forEach(request => {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException("Each item must be a TicketTypeRequest");
      }

      // this gets if its ADULT, CHILD, or INFANT
      const type = request.getTicketType(); 
      //this compute the total number of tickets
      const quantity = request.getNoOfTickets(); 

      totalTickets += quantity;

      // check only a maximum of 25 tickets can be purchased at a time.
      if (totalTickets > 25) {
        throw new InvalidPurchaseException('Cannot purchase more than 25 tickets at once.');
      }

      switch (type) {
        case 'ADULT':
          hasAdult = true;
          numAdults += quantity;
          totalAmount += quantity * 25; 
          totalSeats += quantity;
          break;

        case 'CHILD':
          totalAmount += quantity * 15; 
          totalSeats += quantity;
          totalChild+=quantity
          break;

        case 'INFANT':
          numInfants += quantity;
          break;

        default:
          throw new InvalidPurchaseException(`Unknown ticket type: ${type}`);
      }
    });

    //Child and Infant tickets cannot be purchased without purchasing an Adult ticket.
    if (!hasAdult) {
      throw new InvalidPurchaseException('Child or Infant tickets require at least one Adult ticket.');
    }

    // Each infant must have an adult to sit on their lap.
    if (numInfants > numAdults) {
      throw new InvalidPurchaseException('Each infant must have a corresponding adult.');
    }

    //  Using external payment service 
    const paymentService = new TicketPaymentService();
    // Only Adult and Child tickets are paid
    paymentService.makePayment(accountId, totalAmount); 

    //  Use external seat reservation service — cannot be modified
    const seatService = new SeatReservationService();
    // Only Adult and Child tickets get seats
    seatService.reserveSeat(accountId, totalSeats); 

    return{
        "Message": "Thank you for booking with Tickety – your seats are all set for a great time!",
        "status":"success",
        "summary":{
        totalAmountPaid: totalAmount,
        totalSeatReserved:  totalSeats,
        totalTicketPurchased: totalTickets,
        numberOfInfantComing: numInfants,
        numberOfAdultComing:  numAdults,
        numberofChildComing: totalChild
        }
      }
  
  }
}
