# Event registration

A javascript wrapper around Checkin's event registration form script.

- Makes it easy to load event registration form wherever and whenever you want to
- Pre-fill the registration form with participant and order contact data
- More is coming soon!



https://www.checkin.no/ \
https://www.checkin.no/signup

## Trying the examples

After pulling repository 

```bash
npm install
```
```bash
npm run build
```
\
See an example of how to load registration form [here](https://github.com/checkin/event-registration/blob/master/examples/simple_form_load_example.html) 
```bash
npm run example-form-load-start
```
\
If you want to pre-populate participant and ticket buyer data, \
you can see an example of how to do that [here](https://github.com/checkin/event-registration/blob/master/examples/prefilled_form_example.html) 


```bash
npm run example-form-pre_fill-start
```


## Usage
Using [npm package](https://www.npmjs.com/package/@checkin.no/event-registration)
```bash
npm install @checkin.no/event-registration
```
Showing the registration form

    import { getEventRegistrationForm } from '@checkin.no/event-registration';

    //Create registration form instance
    const eventRegistrationForm = getEventRegistrationForm(eventId);

    //Will mount registration form in the div with id "checkin_registration"
    eventRegistrationForm.initRegistrationForm();


Connect crm property to participant linked to the order contact

    const eventRegistrationForm = getEventRegistrationForm(eventId);
    eventRegistrationForm.setCrmProperty({
        propertKey: 'crm-property-key',
        propertyValue: '123456',
        context: 'orderContactParticipant'
    });
    
