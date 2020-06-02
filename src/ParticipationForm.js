import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, InlineDatePicker } from "material-ui-pickers";
import PaypalButton from './PaypalButton';
import { numberFormat } from './numberFormat';
import { alertService } from './_services/alertService';

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
            id:'',
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
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleDateChange(date) {
        this.setState({
            bday: date
        });
    }

    async handleSubmit(event) {
        //POST Validation participation
        await fetch('/participants/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nom: this.state.firstName,
                prenom: this.state.lastName,
                age: Date.parse(this.state.bday),
                email: this.state.mail
            })
        }).then(response => response.json())
            .then(data => this.setState({id: data.id}));

        fetch('/events/ajoutParticipant/' + this.state.event.id, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: this.state.id
            })
        }).then((response) => {
            //console.log(response);
            if (response.status === 200) {
                console.log('toto');
                alert('Votre participation a bien été enregistrée, un mail vous a été envoyé !');
                //alertService.success('Votre participation a bien été enregistré, un mail vous a été envoyé !', { autoClose: true, keepAfterRouteChange: false });
            }
        });

        //TODO : redirection vers page de confirmation avec alert
        //event.preventDefault();
    }

    render() {
        const {event: event, isLoading} = this.state;

        const onSuccess = (payment) => {
            //console.log('Successful payment!', payment);
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
