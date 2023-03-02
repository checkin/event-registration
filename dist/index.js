class $eb8c646f101a0803$var$EventRegistrationFormTicket {
    participantAdditionalValues = [];
    crmData = null;
    constructor(ticketId){
        this.ticketId = ticketId;
    }
    addAdditional = (additionalId, value)=>{
        if (typeof value === "string") this.participantAdditionalValues.push({
            id: additionalId,
            text: value
        });
        else if (typeof value === "number") this.participantAdditionalValues.push({
            id: additionalId,
            amount: value
        });
        else this.participantAdditionalValues.push({
            id: additionalId
        });
    };
    setParticipantInfo = (data)=>{
        this.crmData = data;
    };
    get predefinedData() {
        return {
            ticketId: this.ticketId,
            additionals: this.participantAdditionalValues,
            crm: this.crmData
        };
    }
}
class $eb8c646f101a0803$var$EventRegistration {
    tickets = [];
    orderContact = null;
    pendingEvents = [];
    propertyValues = [];
    constructor(eventId){
        this.eventId = eventId;
        document.event_id = eventId;
        this.changeEvent = this.changeEvent.bind(this);
        this.initRegistrationForm = this.initRegistrationForm.bind(this);
        this.duplicateScriptsCleanup = this.duplicateScriptsCleanup.bind(this);
        if (document.checkinRegistrationData) {
            if (document.checkinRegistrationData.ticketBuyer) this.orderContact = {
                ...document.checkinRegistrationData.ticketBuyer
            };
            if (document.checkinRegistrationData.crmPropertyValues) this.propertyValues = document.checkinRegistrationData.crmPropertyValues.map((property)=>{
                return {
                    ...property
                };
            });
        }
    }
    changeEvent(eventId) {
        this.eventId = eventId;
        document.event_id = eventId;
        this.initRegistrationForm();
    }
    addTicket = (ticketId, sameAsOrderContact)=>{
        const ticket = new $eb8c646f101a0803$var$EventRegistrationFormTicket(ticketId);
        if (this.orderContact && sameAsOrderContact) ticket.setParticipantInfo(this.orderContact);
        this.tickets.push(ticket);
        return ticket;
    };
    setOrderContact = (data)=>{
        this.orderContact = data;
    };
    setCrmProperty = (data)=>{
        this.propertyValues.push(data);
    };
    get isLoading() {
        return document.checkin_registration_form_loading ?? false;
    }
    set isLoading(loading) {
        document.checkin_registration_form_loading = loading;
    }
    initRegistrationForm(containerElementOrId) {
        if (this.isLoading) {
            this.checkIfInDom();
            return;
        }
        if (this.hasInitialRegistrationData) document.checkinRegistrationData = this.initialRegistrationData;
        let existingRegistrationFormContainer = document.getElementById("checkin_registration");
        if (this.scriptExists && existingRegistrationFormContainer) {
            let parent = existingRegistrationFormContainer?.parentElement;
            if (parent) {
                const elementIndex = Array.from(parent.children).indexOf(existingRegistrationFormContainer);
                parent?.removeChild(existingRegistrationFormContainer);
                const newRegistrationFormContainer = document.createElement("div");
                newRegistrationFormContainer.id = "checkin_registration";
                if (elementIndex >= parent.children.length || parent.children.length === 0) parent?.appendChild(newRegistrationFormContainer);
                else if (parent.children.length === 1 && elementIndex === 0) parent.insertBefore(newRegistrationFormContainer, parent.children[0]);
                else parent.insertBefore(newRegistrationFormContainer, parent.children[elementIndex]);
            }
        }
        const registrationFormContainer = document.createElement("div");
        registrationFormContainer.id = "checkin_registration";
        if (containerElementOrId && !existingRegistrationFormContainer) {
            if (typeof containerElementOrId === "string") {
                document.getElementById(containerElementOrId)?.appendChild(registrationFormContainer);
                existingRegistrationFormContainer = registrationFormContainer;
            } else {
                containerElementOrId.appendChild(registrationFormContainer);
                existingRegistrationFormContainer = registrationFormContainer;
            }
        } else if (!existingRegistrationFormContainer) throw new Error("No registration container element with checkin_registration as id exists. Must provide either containerElement or containerElementId");
        if (!location.protocol.includes("https")) {
            existingRegistrationFormContainer.innerHTML = `<p><b>Cannot initialize form because the connection is not secure</b></p>`;
            console.error("Event registration form will not load without HTTPS connection");
        }
        this.duplicateScriptsCleanup();
        var headTag = document.head;
        var script = document.createElement("script");
        script.src = "https://registration.checkin.no/registration.loader.js";
        script.async = true;
        script.crossOrigin = "anonymous";
        headTag.appendChild(script);
        this.isLoading = true;
        this.checkIfInDom();
        this.checkForMultipleRegistrationDivs();
    }
    checkIfInDom = ()=>{
        setTimeout(()=>{
            if (document.querySelector("#checkin_registration > .registration")) this.isLoading = false;
            else this.checkIfInDom();
        }, 500);
    };
    checkForMultipleRegistrationDivs = ()=>{
        const registrationDivs = document.querySelectorAll("[id=checkin_registration]");
        if (registrationDivs.length > 1) throw Error("You cannot have multiple divs with id checkin_registration in the DOM at the same time");
    };
    get scriptExists() {
        const headScripts = document.head.getElementsByTagName("script");
        for(let i = 0; i < headScripts.length; i++){
            if (headScripts[i].src.includes("https://registration.checkin.no")) return true;
        }
        return false;
    }
    duplicateScriptsCleanup() {
        const headScripts = document.head.getElementsByTagName("script");
        const headLinks = document.head.getElementsByTagName("link");
        const scripts = [];
        const links = [];
        for (const script of headScripts)if (script.src.includes("https://registration.checkin.no")) scripts.push(script);
        for (const link of headLinks)if (link.href.includes("https://registration.checkin.no")) links.push(link);
        if (scripts.length > 1) console.error("Multiple event registration scripts are being loaded. This might cause issues");
        scripts.forEach((script)=>{
            document.head.removeChild(script);
        });
        links.forEach((link)=>{
            document.head.removeChild(link);
        });
    }
    get hasInitialRegistrationData() {
        if (this.orderContact || this.tickets.length > 0) return true;
        return false;
    }
    get initialRegistrationData() {
        return {
            ticketBuyer: this.orderContact,
            tickets: this.tickets.length > 0 ? this.tickets.map((ticket)=>ticket.predefinedData) : null,
            pendingEvents: this.pendingEvents,
            crmPropertyValues: this.propertyValues
        };
    }
}
const $eb8c646f101a0803$export$891d80ce2ae8fbdb = (eventId)=>{
    const registrationForm = new $eb8c646f101a0803$var$EventRegistration(eventId);
    return registrationForm;
};


window.checkin_event = {
    getEventRegistrationForm: (0, $eb8c646f101a0803$export$891d80ce2ae8fbdb)
};


export {$eb8c646f101a0803$export$891d80ce2ae8fbdb as getEventRegistrationForm};
