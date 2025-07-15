// This was created  for testing purpose, prior to the time I  wrote my unit tests


import TicketTypeRequest from './src/pairtest/lib/TicketTypeRequest.js';
import TicketServiceImplementation from './src/pairtest/TicketService.js';

const service = new TicketServiceImplementation();

const req1 = new TicketTypeRequest('ADULT', 25);
const req2 = new TicketTypeRequest('CHILD', 5);
const req3 = new TicketTypeRequest('INFANT', 2);

// capture the returned result
const result = service.purchaseTickets(123, req1, req2, req3);

// log the result to see the output
console.log(result);
