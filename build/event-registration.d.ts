interface IEventRegistrationForm {
    eventId: number;
    addTicket: (ticketId: number, sameAsOrderContact?: boolean) => IEventRegistrationFormTicket;
    setOrderContact: (data: IParticipantCrmData) => void;
    initRegistrationForm: (containerElementId?: string, containerElement?: HTMLElement) => void;
    changeEvent: (eventId: number) => void;
}
interface IEventRegistrationFormTicket {
    addAdditional: (additionalId: number, value: string | number) => void;
    setParticipantInfo: (data: IParticipantCrmData) => void;
}
interface ITicketParticipantCrmAddress {
    address: string;
    zipcode: string;
    city: string;
    country: string;
}
interface IParticipantCrmData {
    name: string;
    phone: string;
    email: string;
    countryCode?: string;
    address?: ITicketParticipantCrmAddress | null;
}
declare global {
    interface Document {
        event_id: number;
        checkinRegistrationData: IInitialEventRegistrationFormData;
    }
    interface Window {
        checkin_event: CheckinEventsWindowProp;
        checkinRegistrationEventHandler: ICheckinEventRegistrationEventHandler;
    }
}
export const getEventRegistrationForm: (eventId: number) => IEventRegistrationForm;
