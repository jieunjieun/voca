import fs from 'fs';
import { useState } from "react";
import styled from "styled-components";
import {Button, Divider, Input} from 'antd';
import useSWR from "swr";
import VocaFile from "model";
const { TextArea } = Input;


const PageWrapper = styled.div`
  
`

const ChapterLabel = styled.div`
  font-size: 18px;
  input {
    width: 100px;
  }
`
const WordsWrapper = styled.div`
  display: flex;
  height: calc(100vh - 64px);  
`

const AddWordSection = styled.div`
  width: 40%;
  height: 100%;
  textarea {
    height: 45%;
    resize: none;
    font-size: 18px;
  }
`;

const WordListSection = styled.div`
  width: 60%;
  height: 100%;
  overflow-y: scroll;
`;

const TotalLabel = styled.div`
  text-align: right;
  margin-right: 40px;
`;
const WordItemEng = styled.div`
  width: 40%;
  font-size: 18px;
  font-weight: bold;
`

const WordItemKo = styled.div`
  width: 55%;
  padding-left: 10px;
`

const WordDeleteButton = styled(Button)`
  width: 10%;
  height: 100%;
  z-index: 1;
`

const WordItemWrapper = styled.div<{ isSelected: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.isSelected ? 'aliceblue' : 'transparent'};
  
  &:hover {
    border: 1px solid deepskyblue;
    background-color: aliceblue;
    cursor: pointer;

    ${WordDeleteButton} {
      opacity: 1;
    }
  }
`;

const WordItem = styled.div`
  width: 80%;
  display: flex;
  height: 70px;
  align-items: center;
  box-sizing: border-box;
  
`;

const wordListFetcher = () => {
  const file = fs.readFileSync('voca-list.json', { encoding: 'utf8'})
  return JSON.parse(file);
}

const ButtonWrapper = styled.div`
  display: flex;
  height: 10%;
  button {
    width: 100%;
    height: 100%;
  }
`
const Words = () => {
  const [currentEnglish, setCurrentEnglish] = useState<string>();
  const [currentKorean, setCurrentKorean] = useState<string>();
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState<number>();
  const [currentChapter, setCurrentChapter] = useState<number>();

  const [isEditMode, setIsEditMode] = useState<boolean>();
  const fileName = 'voca-list.json';

  const { data, mutate } = useSWR<VocaFile>('word-list-fetcher', wordListFetcher);

  const onApplyButtonClickHandler = () => {
    const isFileExist = fs.existsSync(fileName)
    if (isFileExist) {
      let fileData = JSON.parse(fs.readFileSync(fileName, 'utf-8'))
      fileData.push({
        eng: currentEnglish,
        ko: currentKorean
      })
      fs.writeFileSync(fileName, JSON.stringify(fileData));
    } else {
      fs.writeFileSync(fileName, JSON.stringify([
        {
          eng: currentEnglish,
          ko: currentKorean
        }
      ]))
    }

    onResetCurrentWord();
  }

  const onResetCurrentWord = () => {
    setCurrentKorean('');
    setCurrentEnglish('');
    setCurrentSelectedIndex(-1);
    setIsEditMode(false);
    mutate();
  }

  const onEditButtonClickHandler = () => {
    if (!data || currentSelectedIndex === -1) return;

    let newData = [...getReversedData()];
    newData[currentSelectedIndex || 0] = {
      eng: currentEnglish || '',
      ko: currentKorean || ''
    }

    fs.writeFile(fileName, JSON.stringify(newData.reverse()), () => {
      onResetCurrentWord();
    })
  }

  const onWordItemClickHandler = (item: VocaFile[number], index: number) => {
    const { ko, eng } = item;
    setIsEditMode(true);
    setCurrentKorean(ko);
    setCurrentEnglish(eng);
    setCurrentSelectedIndex(index);
  }

  const getReversedData = () => {
    if (!data) return [];
    return  [...data].reverse();
  }

  const onDeleteItemButtonClickHandler = (index: number) => {
    if (!data) return;

    let newData = [...getReversedData()];
    newData.splice(index, 1);
    setIsEditMode(false);

    fs.writeFileSync(fileName, JSON.stringify(newData.reverse()))
    onResetCurrentWord();
  }

  return (
    <PageWrapper>
      <ChapterLabel>챕터 <Input type="number" min={1} onChange={(e) => setCurrentChapter(Number(e.target.value))}/></ChapterLabel>
      <WordsWrapper>
        <AddWordSection>
          <TextArea value={currentEnglish} placeholder="영단어를 입력하세요" onChange={(e) => setCurrentEnglish(e.target.value)}/>
          <TextArea value={currentKorean} placeholder="뜻을 입력하세요" onChange={(e) => setCurrentKorean(e.target.value)}/>
          <ButtonWrapper>{isEditMode ? <Button type="primary" onClick={onEditButtonClickHandler}>Edit</Button> : <Button type="primary" onClick={onApplyButtonClickHandler}>Apply</Button>}<Button onClick={onResetCurrentWord}>Cancel</Button></ButtonWrapper>
        </AddWordSection>
        <WordListSection>
          <TotalLabel>총 {data?.length || 0}개</TotalLabel>
          {
            getReversedData().map((word, index) => {
              return (
                <>
                  <WordItemWrapper isSelected={index === currentSelectedIndex} key={index}>
                    <WordItem  onClick={() => onWordItemClickHandler(word, index)}>
                      <WordItemEng>{word.eng}</WordItemEng>
                      <WordItemKo>{word.ko}</WordItemKo>
                    </WordItem>
                    <WordDeleteButton danger type="primary" onClick={() => onDeleteItemButtonClickHandler(index)}>X</WordDeleteButton>
                  </WordItemWrapper>
                  <Divider style={{ margin: 0}}/>
                </>
              )
            })
          }
        </WordListSection>
      </WordsWrapper>
    </PageWrapper>
  )
}

export default Words;