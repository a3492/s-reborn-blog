---
title: "의사는 어디에 남나요: 의료 AI와 사람의 자리"
description: "초안과 표시를 만드는 프로그램과, 환자를 보고 판단하는 의사의 일을 나눕니다."
date: 2026-03-29
category: doctor-ai
tags: ["AI", "의료", "협력", "첫걸음"]
draft: false
read_time: 8
difficulty: beginner
series: "의료 AI 첫 걸음"
series_order: 1
---

월요일 외래가 시작되기 전, 동료가 화면을 가리키며 묻습니다. “기록은 이제 프로그램이 써 주지 않나요? 그럼 우리는 무엇을 보면 되나요?”

흔히 있을 법한 장면을 가정해 보면, 질문은 도구의 이름보다 역할에서 시작합니다. 바쁜 아침에 필요한 것은 긴 정의가 아니라, 어디까지 맡기고 어디서 의사가 다시 잡으면 되는지의 경계입니다.

## 한 줄로 말하면

의료 AI는 사람이 만든 프로그램입니다. 자료에서 패턴을 찾아 초안, 목록, 표시를 만듭니다. 환자를 만나 진찰하고, 그 결과를 진료에 반영할지는 의사가 정합니다.

<!-- 원장 확인: 면허와 진료 책임의 법리는 이 글에서 조문으로 단정하지 않습니다. 실무 원칙만 적었습니다. -->

## 프로그램이 하는 일

프로그램이 잘하는 일은 넓고 빠른 정리입니다.

말한 내용을 기록 형식으로 나누고, 긴 검사 목록에서 빠뜨리기 쉬운 항목을 다시 보여주고, 영상에서 한 번 더 볼 위치를 표시합니다. 여러 과 기록을 시간순으로 요약해 회의 전에 읽게 할 수도 있습니다.

이 산출물은 출발점입니다. 문장이 매끄럽다고 사실이 되는 것은 아닙니다. 메모에 없는 수치를 프로그램이 채웠다면, 그 문장은 기록에서 빼야 합니다.

## 의사가 하는 일

의사는 환자를 보고, 빠뜨린 이야기를 묻고, 몸을 진찰합니다. 프로그램은 대기실의 표정, 보호자의 한 문장, 어제와 다른 걸음걸이를 대신 보지 못합니다.

판단은 그다음에 옵니다. 가능성의 순서를 정하고, 검사를 할지 말지 정하고, 약을 시작하거나 끊습니다. 환자에게 무엇을 어떻게 말할지도 의사의 일입니다. 초안이 친절해도, 아직 확정하지 않은 병명을 환자에게 건네면 안 됩니다.

협진 편지를 다듬는 일과, 그 편지를 보낼 책임을 지는 일은 다릅니다. 보내는 사람은 의사입니다.

## 같이 앉히는 법

실무에서는 순서를 고정하는 편이 안전합니다.

1. 의사가 먼저 봅니다. 증상, 진찰, 이미 아는 병력을 메모합니다.
2. 프로그램에는 식별 정보를 지운 메모만 넣습니다. 이름, 등록번호, 전화번호, 주소, 희귀해서 바로 누구인지 알 수 있는 사연은 뺍니다.
3. 나온 초안을 원본 메모와 나란히 읽습니다. 메모에 없는 사실은 지웁니다.
4. 환자에게 설명하고 기록에 남기는 문장은 의사가 고친 뒤의 문장만 씁니다.

이 순서를 한 번만 정해 두면, 나중에 만나는 영상 도구나 기록 도구에도 같은 질문을 던질 수 있습니다. “이것은 표시인가, 결정인가.”

<aside class="lecture-note">
<p><strong>핵심 정리</strong></p>
<ul>
<li>프로그램은 초안, 목록, 표시를 만듭니다. 진찰과 결정은 의사가 합니다.</li>
<li>식별 정보는 일반 대화형 도구에 넣지 않습니다.</li>
<li>메모에 없는 사실은 초안에서 지웁니다.</li>
<li>환자에게 나가는 문장은 의사가 고친 뒤의 문장만 씁니다.</li>
<li>다음 글은 그 답이 무슨 자료에서 나왔는지를 묻습니다.</li>
</ul>
</aside>

<details class="lecture-toc">
<summary>전체 차례</summary>
<ol>
<li><a href="/blog/doctor-ai/ai-vs-human-doctor/">의사는 어디에 남나요</a></li>
<li><a href="/blog/doctor-ai/medical-ai-data-sources/">그 답은 무슨 자료에서 나왔나요</a></li>
<li><a href="/blog/doctor-ai/ai-hallucination-medical/">그럴듯한 틀린 답을 어떻게 거르나요</a></li>
<li><a href="/blog/doctor-ai/ai-reliability-metrics/">민감도와 설명, 성적표의 어디를 보나요</a></li>
<li><a href="/blog/doctor-ai/ai-ethics-healthcare/">답이 한쪽으로 기울면 누구의 문제인가요</a></li>
<li><a href="/blog/doctor-ai/medical-ai-regulation/">이 프로그램은 의료기기인가요</a></li>
<li><a href="/blog/doctor-ai/medical-imaging-ai/">영상에서 표시된 곳은 진단인가요</a></li>
<li><a href="/blog/doctor-ai/clinical-note-transcription/">말과 진단명을 초안으로 옮길 때</a></li>
<li><a href="/blog/doctor-ai/discharge-plan-prompt/">환자에게 건네기 전에</a></li>
<li><a href="/blog/doctor-ai/drug-interaction-ai/">많은 약을 한 번 더 볼 때</a></li>
<li><a href="/blog/doctor-ai/acute-abdominal-pain-case/">급성 증상에서 감별 목록을 적는다면</a></li>
<li><a href="/blog/doctor-ai/diabetes-management-ai/">진료가 한 번으로 끝나지 않을 때</a></li>
<li><a href="/blog/doctor-ai/clinical-trial-matching-ai/">임상시험 목록은 누가 고르나요</a></li>
</ol>
</details>

<p class="lecture-path">이전 없음 · <a href="/blog/doctor-ai/medical-ai-data-sources/">다음</a></p>

<p class="lecture-path">관련 <a href="/blog/faq/will-ai-replace-doctors/">AI가 환자 진료를 완전히 대체할 수 있을까?</a> · <a href="/blog/doctor-ai/ai-hallucination-medical/">그럴듯한 틀린 답을 어떻게 거르나요</a> · <a href="/blog/prompt-engineering/prompt-engineering-for-doctors/">프롬프트 엔지니어링 기초 — 의사를 위한 실전 가이드</a></p>
