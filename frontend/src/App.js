import { useEffect, useState } from 'react';

import io from 'socket.io-client';
import styled from 'styled-components';

// components
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

//context
import UserContext from './context/UserContext';

import './reset.scss';

const socket = io('http://localhost:5000', { autoConnect: false, auth: { token: sessionStorage.getItem('token') } });

const Main = styled.main`
  display: flex;
  background-color: #fff;
  width: 1200px;
  height: 700px;
  border-radius: 2rem;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  overflow: hidden;
`;

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  background-color: #ececfb;
  height: 100%;
  width: 250px;
`;

const AsideHeader = styled.header`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: .5rem;
  height: 100px;
  padding: 0 1rem;
  border-bottom: 1px solid #cbced1;
`;

const UsersList = styled.ul`
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    position: relative;
    background-color: #ececfb;
    display: flex;
    align-items: center;
    height: 70px;
    padding: .5rem;
    cursor: pointer;

    &::after {
      content: "";
      position: absolute;
      background-color: #cbced1;
      height: 1px;
      width: 90%;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    &:hover {
      background-color: #e5e5f3;
    }
  }
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
`;

const ChatHeader = styled.header`
  display: flex;
  align-items: center;
  height: 100px;
  padding: 0 2rem;
  border-bottom: 1px solid #ececfb;
`;

const UserAvatar = styled.div`
  background: gray;
  height: 50px;
  width: 50px;
  border-radius: 55rem;
`;

const ChatMessages = styled.section`
  flex: 1;
  padding: 1.5rem;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    width: .5rem;
  }

  &::-webkit-scrollbar-thumb {
    -webkit-appearance: none;
    background-color: #dee2e6;
    border-radius: .25rem;
  }
`;

const ChatMessageBalloon = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  background: blue;
  min-height: 70px;
  min-width: 300px;
  max-width: 50%;
  padding: .5rem;
  border-radius: .5rem;

  ::after {
    position: absolute;
    top: 0;
    content: "";
    width: 0;
    height: 0;
    border: .25rem solid transparent;
  }

  &.me {
    background: #ececfb;
    border-top-right-radius: 0;

    ::after {
      border-top-color: #ececfb;
      border-left-color: #ececfb;
      left: 100%;
    }
  }

  &.received {
    background: #dcdce9;
    border-top-left-radius: 0;

    ::after {
      border-top-color: #dcdce9;
      border-right-color: #dcdce9;
      right: 100%;
    }
  }

  p {
    flex: 1;
    line-height: 1.2;
    word-break: break-word;
    white-space: normal;
    margin: 0;
  }
`;

const ChatFooter = styled.footer`
  display: flex;
  align-items: center;
  min-height: 60px;
  padding: .5rem 2rem;
  border-top: 1px solid #ececfb;
`;

const ChatMessageForm = styled.form`
  display: flex;
  align-items: center;
  min-height: 100%;
  width: 100%;

  div[contenteditable] {
    position: relative;
    bottom: 0;
    display: flex;
    align-items: center;
    min-height: 40px;
    width: 600px;
    padding: .25rem;
    border: 1px solid #dee2e6;
    border-top-left-radius: .25rem;
    border-bottom-left-radius: .25rem;
    white-space: normal;
    word-break: break-word;
  }

  button[type="submit"]{
    background: #ececfb;
    width: 40px;
    height: 40px;
    border: 1px solid #dee2e6;
    border-top-right-radius: .25rem;
    border-bottom-right-radius: .25rem;
  }
`;

const App = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loginModalShow, setLoginModalShow] = useState(false);
  const [registerModalShow, setRegisterModalShow] = useState(false);

  socket.on('connect', () => {
  });

  socket.on('get messages', (messages) => {
    setMessages(messages);
  });

  socket.on('get users', (users) => {
    setUsers(users);
  });

  socket.on('get authenticated', (token) => {
    
  });

  const handleMessageSender = evt => {
    evt.preventDefault();

    const text = evt.target.querySelector('#text').innerText;
    socket.emit('send message', { text });
  };

  useEffect(() => {
    socket.connect();
    
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Main>
        <LoginModal show={loginModalShow} setShow={setLoginModalShow} socket={socket} />
        <RegisterModal show={registerModalShow} setShow={setRegisterModalShow} socket={socket} />
        
        <Aside>
          <AsideHeader>
            <div className="d-flex align-items-center">
              <UserAvatar />
              <strong className="ms-2">Milton</strong>
            </div>
            <form>
              <input className="rounded-1 border border-secondary" type="text" placeholder='Pesquisar'/>
            </form>
          </AsideHeader>
          <UsersList>
            {
              users.map(user => (
                <li>
                  <UserAvatar />
                  <div className="ms-2">
                    <strong>{user.name}</strong><br/>
                    <small>Ultima mensagem</small>
                  </div>
                </li>
              ))
            }
          </UsersList>
        </Aside>
        <ChatContainer>
          {
            !user ?
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <h3>Você não está conectado.</h3>
              <div className="d-flex gap-3 align-items-center mt-3">
                <button 
                  className="btn btn-primary rounded-0 shadow-sm"
                  onClick={() => setLoginModalShow(true)}
                >
                  Faça login
                </button>
                ou
                <button
                  className="btn btn-primary rounded-0 shadow-sm"
                  onClick={() => setRegisterModalShow(true)}
                >
                  Crie uma conta
                </button>
              </div>
            </div> :
            <>
              <ChatHeader>
                <UserAvatar />
                <div className="ms-3">
                  <strong>Geefi</strong>
                  <br/>
                  <small className="text-muted">Online</small>
                </div>
              </ChatHeader>
              <ChatMessages>
                {
                  messages.map((message) => (
                    <div className={`d-flex my-2 justify-content-${message?.authorId === user.id ? 'end' : 'start'}`}>
                      <ChatMessageBalloon className={`${message?.authorId === user.id ? 'me' : 'received'}`}>
                        <p>
                          {message?.text}
                        </p>
                        <small className="text-end">{message.time}</small>
                      </ChatMessageBalloon>
                    </div>
                  ))
                }
              </ChatMessages>
              <ChatFooter>
                <ChatMessageForm onSubmit={handleMessageSender}>
                  <div id="text" contentEditable></div>
                  <button type="submit">Enviar</button>
                </ChatMessageForm>
              </ChatFooter>
            </>
          }
        </ChatContainer>
      </Main>
    </UserContext.Provider>
  );
};

export default App;
