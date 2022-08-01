import styled from "styled-components";
import {Button} from "antd";
import useSWR from "swr";
import VocaFile from "model";
import fs from "fs";
import {sample, sampleSize, shuffle} from 'lodash';
import {useEffect, useState} from "react";

const RandomPageWrapper = styled.div`
  width: 100%;
  height: calc(100vh - 32px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const Title = styled.div`
  font-size: 50px;
  font-weight: bold;
`

const AnswerWrapper = styled.div`
  margin-top: 80px;
  display: flex;
  flex-direction: column;
`

const AnswerItem = styled(Button)`
  min-width: 500px;
  height: 70px;
  & + & {
    margin-top: 20px;
  }
`

const wordListFetcher = () => {
  const file = fs.readFileSync('voca-list.json', { encoding: 'utf8'})
  return JSON.parse(file);
}

type QuizForm = {
  question: VocaFile[number]["eng"];
  answer: VocaFile[number]["ko"];
  answers: VocaFile[number]["ko"][];
}

type RemainedVocaType = (VocaFile[number] & { solved?: boolean })[]

const RandomQuiz = () => {
  const [quizData, setQuizData] = useState<RemainedVocaType>();
  const [currentQuiz, setCurrentQuiz] = useState<QuizForm>();
  const { data } = useSWR<VocaFile>('word-list-fetcher', wordListFetcher);

  if (!quizData) setQuizData(data);

  useEffect(() => {
    nextQuiz();
  }, [])

  const nextQuiz = () => {
    if (!quizData || !data) return;

    const newQuiz = sample(quizData.filter((word) => !word.solved));
    const otherAnswers = sampleSize(data.filter((word) => word !== newQuiz), 3);

    if (!newQuiz) return;
    setCurrentQuiz({
      question: newQuiz.eng,
      answer: newQuiz.ko,
      answers: shuffle([newQuiz.ko, ...otherAnswers.map((word) => word.ko)]),
    })
  }


  const onAnswerClickHandler = (selectedAnswer: string) => {
    if (!currentQuiz) return;
    if (selectedAnswer !== currentQuiz?.answer) return;

    checkSolvedWord();
    nextQuiz();
  }

  const checkSolvedWord = () => {
    const quizDataWithSolvedCheck = quizData?.map((word) => {
      if (word.ko === currentQuiz?.answer) {
        return {
          ...word,
          solved: true,
        }
      }
      return word;
    })
    setQuizData(quizDataWithSolvedCheck)
  }


  if (quizData?.every((v) => v.solved)) return <RandomPageWrapper>The end</RandomPageWrapper>
  if (!currentQuiz) return null;
  return (
    <RandomPageWrapper>
      <Title>{currentQuiz.question}</Title>
      <AnswerWrapper>
        {currentQuiz.answers.map((item, index) => {
          return <AnswerItem key={`${item}-${index}`} onClick={() => onAnswerClickHandler(item)}>{item}</AnswerItem>
        })}
      </AnswerWrapper>
    </RandomPageWrapper>
  )
}

export default RandomQuiz;