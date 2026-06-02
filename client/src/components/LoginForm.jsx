import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { doLogin } from '../apis/auth.js';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from 'react-router';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function LoginForm(props) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [alert, setAlert] = useState(false);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try { 
      const user = await doLogin(email, pass);
      props.userSetter(user);
      console.log(user);
      navigate('/setup');
    } catch(err) {
      setAlert(true);
    }
  };

  return (
   
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
       
        <Col xs={11} sm={8} md={5} lg={4} className="p-4 border rounded-3 shadow-sm bg-white">
          
          <div className="text-center mb-4">
            {alert ? (
              <Alert key='danger' variant="danger" className="py-2 small"> 
                Your credentials do not match
              </Alert>
            ) : (
              <h5 className="text-secondary fw-normal">Introduce your data to login</h5>
            )}
          </div>

          <Form onSubmit={handleSubmitForm}>
            <Form.Group className="mb-4" controlId="formBasicEmail">
              <Form.Label className="small fw-semibold">Email address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter email" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (alert) setAlert(false); 
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicPassword">
              <Form.Label className="small fw-semibold">Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Password" 
                value={pass} 
                onChange={(e) => {
                  setPass(e.target.value);
                  if (alert) setAlert(false); 
                }}
              />
            </Form.Group>
           
            <Button variant="primary" type="submit" className="w-100 py-2 mt-2 fw-semibold">
              Submit
            </Button>
          </Form>
          
        </Col>
      </Row>
    </Container>
  );
}

export default LoginForm;