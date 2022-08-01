import styled from 'styled-components'
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';


const MainWrapper = styled.div`
  width: 100%;
  height: calc(100vh - 32px);
  display: flex;
  justify-content: center;
  align-items: center;
  
  button + button {
    margin-left: 20px;
  }
`
const Main = () => {
  const navigate = useNavigate();
  return (
    <MainWrapper>
      <Button size="large" type="primary" onClick={() => navigate('/words')}>단어 등록하기</Button>
      <Button size="large" type="primary" onClick={() => navigate('/quiz')}>전체 퀴즈 풀기</Button>
    </MainWrapper>
  )
}

export default Main;