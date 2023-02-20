
export interface IEventRegistrationForm {
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

interface IOrderContactParticipant {
    crmProperties: ICrmProperty[];
}

interface IOrderContactData extends IParticipantCrmData {
    participant?: IOrderContactParticipant;
}


interface IInitialEventRegistrationFormTicketData {
    ticketId: number;
    additionals: IEventRegistrationFormParticipantAdditional[];
    crm: IParticipantCrmData | null;
}

export interface IInitialEventRegistrationFormData {
    ticketBuyer: IParticipantCrmData | null;
    tickets: IInitialEventRegistrationFormTicketData[] | null;
    pendingEvents?: IEventRegistrationEvent[];
    crmPropertyValues?: IEventSetCrmProperty[];
}

export type EventRegistrationEvents = 'set-crm-property';

export interface IEventSetCrmProperty {
    propertyKey: string;
    propertyValue: string | boolean | number;
    context: 'participant' | 'orderContactParticipant';
    participantId?: string;
}
export interface IEventRegistrationEvent {
    event: EventRegistrationEvents;
    data: IEventSetCrmProperty;
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
    orderContact: IOrderContactData | null = null;
    pendingEvents: IEventRegistrationEvent[] = [];
    propertyValues: IEventSetCrmProperty[] = [];
    constructor(eventId: number) {
        this.eventId = eventId;
        document.event_id = eventId;
        this.changeEvent = this.changeEvent.bind(this);
        this.initRegistrationForm = this.initRegistrationForm.bind(this);
        this.duplicateScriptsCleanup = this.duplicateScriptsCleanup.bind(this);

        if(document.checkinRegistrationData) {
            if(document.checkinRegistrationData.ticketBuyer) {
                this.orderContact = {...document.checkinRegistrationData.ticketBuyer};
            }
            if(document.checkinRegistrationData.crmPropertyValues) {
                this.propertyValues = document.checkinRegistrationData.crmPropertyValues.map(property => {
                    return {...property};
                })
            }
        }
    };

    changeEvent(eventId: number) {
        this.eventId = eventId;
        document.event_id = eventId;
        this.initRegistrationForm();
    }

    addTicket = (ticketId: number, sameAsOrderContact?: boolean): IEventRegistrationFormTicket => {
        const ticket = new EventRegistrationFormTicket(ticketId);
        if(this.orderContact && sameAsOrderContact) {
            ticket.setParticipantInfo(this.orderContact);
        };

        this.tickets.push(ticket);

        return ticket;
    }


    setOrderContact = (data: IOrderContactData) => {
        this.orderContact = data;
    }

    setCrmProperty = (data: IEventSetCrmProperty) => {
        this.propertyValues.push(data);
        
    }

    initRegistrationForm(containerElementOrId?: HTMLElement | string) {
        if(this.hasInitialRegistrationData) {
            document.checkinRegistrationData = this.initialRegistrationData;
        }
        let existingRegistrationFormContainer = document.getElementById('checkin_registration');
        if(this.scriptExists && existingRegistrationFormContainer) {
            let parent = existingRegistrationFormContainer?.parentElement;
            if(parent) {
                const elementIndex = Array.from(parent.children).indexOf(existingRegistrationFormContainer);
                parent?.removeChild(existingRegistrationFormContainer);
                const newRegistrationFormContainer = document.createElement('div');
                newRegistrationFormContainer.id = 'checkin_registration';
        
                if(elementIndex >= parent.children.length || parent.children.length === 0) {
                    parent?.appendChild(newRegistrationFormContainer);
                } else if(parent.children.length === 1 && elementIndex === 0) {
                    parent.insertBefore(newRegistrationFormContainer, parent.children[0]);
                } else {
                    parent.insertBefore(newRegistrationFormContainer, parent.children[elementIndex]);
                } 

            }
        }
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
        this.duplicateScriptsCleanup();
        var headTag = document.head;
        var script = document.createElement('script');
        script.src = 'https://registration.checkin.no/registration.loader.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        headTag.appendChild(script);
    };

    private get scriptExists(): boolean {
        const headScripts = document.head.getElementsByTagName('script');
        for(let i = 0; i < headScripts.length; i++) {
            if(headScripts[i].src.includes('https://registration.checkin.no')) {
                return true;
            }
        }
        return false;
    }

    private duplicateScriptsCleanup() {
        const headScripts: any = document.head.getElementsByTagName('script');
        const headLinks: any = document.head.getElementsByTagName('link');
      
        const scripts = [];
        const links = [];
        for(const script of headScripts) {
            if(script.src.includes('https://registration.checkin.no')) {
                scripts.push(script);
            }
        }

        for(const link of headLinks) {
            if(link.href.includes('https://registration.checkin.no')) {
                links.push(link);
            }
        }
        if(scripts.length > 1) {
            console.error("Multiple event registration scripts are being loaded. This might cause issues");
        };
        scripts.forEach(script => {
            document.head.removeChild(script);
        });
        links.forEach(link => {
            document.head.removeChild(link);
        });
    };

    get hasInitialRegistrationData() {
        if(this.orderContact || this.tickets.length > 0) {
            return true;
        }
        return false;
    }


    get initialRegistrationData(): IInitialEventRegistrationFormData {
        return {
            ticketBuyer: this.orderContact,
            tickets: this.tickets.length > 0 ? this.tickets.map(ticket => (ticket.predefinedData)) : null,
            pendingEvents: this.pendingEvents,
            crmPropertyValues: this.propertyValues
        }
    }
}

const getEventRegistrationForm = (eventId: number): IEventRegistrationForm => {
    const registrationForm = new EventRegistration(eventId);

    return registrationForm;
}


export {getEventRegistrationForm}