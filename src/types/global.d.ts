import {
  EventRegistrationEvents,
  IEventRegistrationForm,
  IEventSetCrmProperty,
  IInitialEventRegistrationFormData,
} from "../EventRegistration";

export {};
interface CheckinEventsWindowProp {
  getEventRegistrationForm: (eventId: number) => IEventRegistrationForm;
}

interface ICheckinEventRegistrationEventHandler {
  dispatchEvent: (
    event: EventRegistrationEvents,
    data: IEventSetCrmProperty
  ) => void;
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
