import { useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';

// context
import UserContext from '../context/UserContext';

import LoadingButton from './LoadingButton';

const RegisterModal = ({ show, setShow, socket }) => {
  const [loadingButtonActive, setLoadingButtonActive] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const handleSubmit = evt => {
    evt.preventDefault();

    const form = evt.target;
    const data = {
      name: form.name.value,
      password: form.password.value
    };

    setLoadingButtonActive(true);
    socket.emit('user register', data);

    socket.on('user register response', (res) => {
      setLoadingButtonActive(false);
      setShow(false);
      const { token, user } = res;
  
      setUser(user);
      sessionStorage.setItem('token', token);
      socket.disconnect();
      socket.auth.token = token;
      socket.connect();
      socket.off('user register response');
    });
  };

  return (
    <Modal show={show}>
      <Modal.Body>
        <h4 className="mb-4">Faça seu registro</h4>
        <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
          <input className="form-control shadow-none" type="text" placeholder="Usuario" name="name" autoComplete="off" />
          <input className="form-control shadow-none" type="password" placeholder="Senha" name="password" />
          <div className="d-flex justify-content-end">
            <LoadingButton active={loadingButtonActive} />
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterModal;