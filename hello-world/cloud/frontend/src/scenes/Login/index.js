import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import _ from 'lodash';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';
import { Context } from '../../context/store';

const Login = () => {
  const { authenticator, login } = useContext(Context);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msgError, setMsgError] = useState('');
  const [redirect, setRedirect] = useState(false);

  return <Grid textAlign='center' style={{ height: '80vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
      <Header as='h2' color='green' textAlign='center'>
        <Image src='https://static.wixstatic.com/media/c9c95d_141fd3ce48914003b1c14521a48adeb3~mv2.png/v1/fill/w_100,h_105,al_c,q_80/c9c95d_141fd3ce48914003b1c14521a48adeb3~mv2.webp' />
        Log-in to your account
      </Header>
      <Form>
        <Segment>
          <Form.Input
            fluid
            required
            icon='user'
            iconPosition='left'
            placeholder='E-mail address'
            type="email"
            onChange={e => setEmail(e.target.value)}
          />
          <Form.Input
            fluid
            required
            icon='lock'
            iconPosition='left'
            placeholder='Password'
            type='password'
            onChange={e => setPassword(e.target.value)}
          />
          <Button
            fluid
            color='green'
            size='large'
            type="submit"
            onClick={async () => {
              try {
                const { uuid, token } = await authenticator.authUser(email, password);
                login(uuid, token);
                setMsgError('');
                setRedirect(true);
              } catch (err) {
                if (err.response) {
                  setMsgError(err.response.data.message);
                } else {
                  setMsgError(err.message);
                }
              }
            }}
          >
            Login
          </Button>
        </Segment>
      </Form>
      {redirect && <Redirect to="/" />}
      <Message hidden={_.isEmpty(msgError)} error={!_.isEmpty(msgError)}>
        {msgError}
      </Message>
      <Message>
        <a href='https://knot.cloud/signup'>Sign-up on KNoT Cloud</a>
      </Message>
    </Grid.Column>
  </Grid>;
}

export default Login;
