declare global {
	interface Document {
		event_id: number;
        checkinRegistrationData: IInitialEventRegistrationFormData;
	}
    interface Window {
        checkin_event: CheckinEventsWindowProp;
    }
}

interface CheckinEventsWindowProp {
    getEventRegistrationForm: (eventId: number) => IEventRegistrationForm;
}

interface IEventRegistrationForm {
    eventId: number;
    addTicket: (ticketId: number, sameAsTicketBuyer?: boolean) => IEventRegistrationFormTicket;
    setTicketBuyer: (data: IParticipantCrmData) => void;
    initRegistrationForm: (containerElementId?: string, containerElement?: HTMLElement) => void;
}

interface IEventRegistrationFormTicket {
    addAdditional: (additionalId: number, value: string | number) => void;
    setParticipantInfo: (data: IParticipantCrmData) => void;
}

interface IEventRegistrationFormParticipantAdditional {
    id: number;
    text?: string;
    amount?: number;
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

interface ICrmProperty {
    key: string;
    value: string | number | boolean;
}

interface ITicketBuyerParticipant {
    crmProperties: ICrmProperty[];
}

interface ITicketBuyerData extends IParticipantCrmData {
    participant?: ITicketBuyerParticipant;
}


interface IInitialEventRegistrationFormTicketData {
    ticketId: number;
    additionals: IEventRegistrationFormParticipantAdditional[];
    crm: IParticipantCrmData | null;
}

interface IInitialEventRegistrationFormData {
    ticketBuyer: IParticipantCrmData | null;
    tickets: IInitialEventRegistrationFormTicketData[] | null;
}

class EventRegistrationFormTicket implements IEventRegistrationFormTicket {
    ticketId: number;
    participantAdditionalValues: IEventRegistrationFormParticipantAdditional[] = [];
    crmData: IParticipantCrmData | null = null;

    constructor(ticketId: number) {
        this.ticketId = ticketId;
    }

    addAdditional = (additionalId: number, value?: string | number) => {
        if(typeof(value) === 'string') {
            this.participantAdditionalValues.push({id: additionalId, text: value});
        } else if(typeof(value) === 'number') {
            this.participantAdditionalValues.push({id: additionalId, amount: value});
        } else {
            this.participantAdditionalValues.push({id: additionalId});
        }
    }

    setParticipantInfo = (data: IParticipantCrmData) => {
        this.crmData = data;
    }

    get predefinedData(): IInitialEventRegistrationFormTicketData {
        return {
            ticketId: this.ticketId,
            additionals: this.participantAdditionalValues,
            crm: this.crmData
        }
    } 
}

class EventRegistration implements IEventRegistrationForm {
    eventId: number;
    tickets: EventRegistrationFormTicket[] = [];
    ticketBuyer: ITicketBuyerData | null = null;

    constructor(eventId: number) {
        this.eventId = eventId;
        document.event_id = eventId;
    };

    addTicket = (ticketId: number, sameAsTicketBuyer?: boolean): IEventRegistrationFormTicket => {
        const ticket = new EventRegistrationFormTicket(ticketId);
        if(this.ticketBuyer) {
            ticket.setParticipantInfo(this.ticketBuyer);
        };

        this.tickets.push(ticket);

        return ticket;
    }


    setTicketBuyer = (data: ITicketBuyerData) => {
        this.ticketBuyer = data;
    }

    setTicketBuyerParticipantProperty = (propertyKey: string, value: string | number | boolean) => {
        this.ticketBuyer?.participant?.crmProperties.push({key: propertyKey, value: value});
    }

    initRegistrationForm(containerElementOrId?: HTMLElement | string) {
        if(this.hasInitialRegistrationData) {
            document.checkinRegistrationData = this.initialRegistrationData;
        }
        let existingRegistrationFormContainer = document.getElementById('checkin_registration');
        const registrationFormContainer = document.createElement('div');
        registrationFormContainer.id = "checkin_registration";
        if(containerElementOrId && !existingRegistrationFormContainer) {
            if(typeof containerElementOrId === 'string') {
                document.getElementById(containerElementOrId)?.appendChild(registrationFormContainer);
                existingRegistrationFormContainer = registrationFormContainer;
            } else {
                containerElementOrId.appendChild(registrationFormContainer)
                existingRegistrationFormContainer = registrationFormContainer;
            }
        }  else if(!existingRegistrationFormContainer) {
            throw new Error('No registration container element with checkin_registration as id exists. Must provide either containerElement or containerElementId');
        }

        if(!location.protocol.includes('https')) {
            existingRegistrationFormContainer.innerHTML = `<p><b>Cannot initialize form because the connection is not secure</b></p>`;
            console.error('Event registration form will not load without HTTPS connection');
        };

        //Check if script already exists and cleanup if it does
        this.duplicateScriptsCleanup();
        var headTag = document.head;
        var script = document.createElement('script');
        script.src = 'https://registration.checkin.no/registration.loader.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        headTag.appendChild(script);
    };


    private duplicateScriptsCleanup(): void {
        const headScripts = document.head.getElementsByTagName('script');
        const scripts = [];
        for(const script of headScripts) {
            if(script.src === 'https://registration.checkin.no/registration.loader.js') {
                scripts.push(script);
                document.head.removeChild(script);
            }
        }
        if(scripts.length > 1) {
            console.error("Multiple event registration scripts are being loaded. This might cause issues");
        };
    };

    get hasInitialRegistrationData() {
        if(this.ticketBuyer || this.tickets.length > 0) {
            return true;
        }
        return false;
    }


    get initialRegistrationData(): IInitialEventRegistrationFormData {
        return {
            ticketBuyer: this.ticketBuyer,
            tickets: this.tickets.length > 0 ? this.tickets.map(ticket => (ticket.predefinedData)) : null
        }
    }
}

const getEventRegistrationForm = (eventId: number): IEventRegistrationForm => {
    const registrationForm = new EventRegistration(eventId);

    return registrationForm;
}


export {getEventRegistrationForm}