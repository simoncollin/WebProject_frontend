import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, InlineDatePicker } from "material-ui-pickers";
import PaypalButton from './PaypalButton';
import { numberFormat } from './numberFormat';

const CLIENT = {
    sandbox: process.env.REACT_APP_PAYPAL_CLIENT_ID_SANDBOX,
    production: process.env.REACT_APP_PAYPAL_CLIENT_ID_PRODUCTION,
};

const ENV = process.env.NODE_ENV === 'production'
    ? 'production'
    : 'sandbox';

class ParticipationForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            bday: new Date(),
            mail: '',
            payment: '',
            event: '', isLoading: false, error: null};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        //this.handleDateChange = this.handleDateChange(this);
    }

    async componentDidMount() {
        await fetch('/events/'+this.props.match.params.idevent)
            .then(response => response.json())
            .then(data => this.setState({event: data}))
            .catch(error => this.setState({ error, isLoading: false }));
    }

    handleChange(event) {
        console.log('event');
        console.log(event.target);
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
        console.log('state');
        console.log(Date.parse(this.state.bday));
    }

    handleDateChange(date) {
        this.setState({
            bday: date
        });
    }

    handleSubmit(event) {
        console.log('Le formulaire a été soumis : ' + this.state);
        //POST Validation participation
        fetch('/participants/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nom: this.state.firstName,
                prenom: this.state.lastName,
                age: Date.parse(this.state.bday),
                email: this.state.mail,
                event: this.state.event
            })
        }).then(function (response) {
            console.log(response);
        });

        //redirection vers page de confirmation
        console.log(this.state);
        //event.preventDefault();
    }

    render() {
        const {event: event, isLoading} = this.state;

        const onSuccess = (payment) => {
            console.log('Successful payment!', payment);
            this.state.payment = payment;
            this.handleSubmit();
        };

        const onError = (error) =>
            console.log('Erroneous payment OR failed to load script!', error);

        const onCancel = (data) =>
            console.log('Cancelled payment!', data);

        if (isLoading) {
            return <p>Loading...</p>;
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <React.Fragment>
                    <Typography variant="h6" gutterBottom>
                        Qui êtes vous ?
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                id="firstName"
                                name="firstName"
                                label="Prénom"
                                fullWidth
                                autoComplete="fname"
                                onChange={this.handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                id="lastName"
                                name="?m"
                                label="Nom"
                                fullWidth
                                autoComplete="lname"
                                onChange={this.handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <InlineDatePicker required
                                                  name="bday"
                                                  value={this.state.bday}
                                                  label={"Date de naissance"}
                                                  onChange={date => this.handleDateChange(date)}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                id="email"
                                name="mail"
                                label="Mail"
                                fullWidth
                                autoComplete="email"
                                onChange={this.handleChange}
                            />
                        </Grid>
                    </Grid>
                </React.Fragment>
                <br/>
                <div>
                    Valider et payer {numberFormat(event.prix)} :
                </div>
                <PaypalButton
                    client={CLIENT}
                    env={ENV}
                    commit={false}
                    currency={'EUR'}
                    total={event.prix}
                    onSuccess={onSuccess}
                    onError={onError}
                    onCancel={onCancel}
                />
            </form>
        );
    }
}

export default ParticipationForm;
