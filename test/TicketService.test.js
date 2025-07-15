import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

// Mock the external services
jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService.js', () => {
  return jest.fn().mockImplementation(() => ({
    makePayment: jest.fn()
  }));
});

jest.mock('../src/thirdparty/seatbooking/SeatReservationService.js', () => {
  return jest.fn().mockImplementation(() => ({
    reserveSeat: jest.fn()
  }));
});

describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
  });

  test('should successfully purchase valid tickets', () => {
    const req1 = new TicketTypeRequest('ADULT', 2);
    const req2 = new TicketTypeRequest('CHILD', 1);
    const req3 = new TicketTypeRequest('INFANT', 1);

    const result = ticketService.purchaseTickets(1001, req1, req2, req3);

    expect(result.status).toBe('success');
    expect(result.summary.totalAmountPaid).toBe(2 * 25 + 1 * 15);
    expect(result.summary.totalSeatReserved).toBe(3);
    expect(result.summary.totalTicketPurchased).toBe(4);
  });

  test('should throw if no adult is included', () => {
    const child = new TicketTypeRequest('CHILD', 1);

    expect(() => ticketService.purchaseTickets(123, child)).toThrow(InvalidPurchaseException);
  });

  test('should throw if more than 25 tickets are purchased', () => {
    const adult = new TicketTypeRequest('ADULT', 26);

    expect(() => ticketService.purchaseTickets(123, adult)).toThrow(InvalidPurchaseException);
  });

  test('should throw if infants > adults', () => {
    const adult = new TicketTypeRequest('ADULT', 1);
    const infant = new TicketTypeRequest('INFANT', 2);

    expect(() => ticketService.purchaseTickets(123, adult, infant)).toThrow(InvalidPurchaseException);
  });

  test('should throw if accountId is invalid', () => {
    const adult = new TicketTypeRequest('ADULT', 1);

    expect(() => ticketService.purchaseTickets(-5, adult)).toThrow(InvalidPurchaseException);
  });
});
