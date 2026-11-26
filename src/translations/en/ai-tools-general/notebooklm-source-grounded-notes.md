---
translation: en
---

The following is a fictional scenario for illustration.

Seo-yeon had to submit a literature comparison table on Monday. On Saturday morning, she stopped at a cell NotebookLM filled with "30 participants." Opening the citation revealed that 30 was the number analyzed, whereas she wanted initial enrollment. The number appeared in the source. **It was not the number she had asked for.**

**In one sentence:** NotebookLM makes it easier to move between sources. Before transferring a value, check the original table title, row, column and footnote.

<figure class="editorial-figure" data-editorial-figure id="notebooklm-cohort-figure">
<svg viewBox="0 0 420 184" role="img" aria-label="A fictional study includes 30 people in the final analysis. The total enrollment is unspecified."><path class="editorial-ink" d="M12 162V20h396v142z"/><text x="29" y="51" font-size="16">All enrolled participants</text><path class="editorial-accent" fill="none" d="M29 145V75h227v70z"/><text class="editorial-accent" x="44" y="105" font-size="16">Final analysis: 30</text><text class="editorial-note" x="44" y="129" font-size="14">Group cited</text><text class="editorial-note" font-size="14" x="268" y="95">Enrollment:</text><text class="editorial-note" font-size="14" x="268" y="122">verify separately</text></svg>
<figcaption>Thirty is the number included in analysis. Verify enrollment separately, for example in Methods. Outlines are not proportional to group size.</figcaption>
</figure>

## Why an answer can be wrong even when the number is right

Enrollment counts people entering a study. The final analysis count covers those included when calculating results. Withdrawal or missing data can make these numbers differ. Copying "30" can reproduce the number correctly while changing the group counted.

NotebookLM citations are a starting point for locating relevant text. When copying a cell, check the document name, table title, row label and column heading together. Read [Introduction to RAG (Korean)](/blog/rag-finetuning/what-is-rag/) for how retrieved passages help users compare answers with sources.

## Specify the scope and leave unknown values blank

Seo-yeon uploaded three public papers and defined comparison fields. Replace the brackets with real document names and table titles.

> For [papers A, B and C], find study design, enrollment and final analysis count in [table title], and organize them into a table. Include document name, page and table title for each cell. If the information is absent from the table or footnotes, mark it "Needs verification."

The [official Google guide](https://support.google.com/gemininotebook/answer/16179559) explains opening citations in chat answers to check sources.

## Open the citation and check three things

1. **Is it the same field?** Separate enrollment and analysis. Check column title, population and time point.
2. **Is it the same value?** Read units, decimal points and footnotes in the original. Inspect complex tables or scans directly in the PDF.
3. **Can you find the location again?** Record document, page and table number. Mark inaccessible or unverified values "Needs verification."

An audio overview can help identify research questions and reading order. Verify wording and numbers you intend to cite against the PDF itself. Use public material for practice. Check organizational upload policies before using patient or unpublished research data.

Seo-yeon separated enrollment and analysis columns and kept a source column so another reader could find the same value.

## Practice the check with one fictional PDF

Seo-yeon opened fictional paper A. Methods mentioned enrollment, while Results mentioned inclusion in analysis. Label "30" **final analysis** and leave enrollment blank until checked separately in Methods or the participant flow. If a footnote says only a particular subgroup was included, do not label it the entire analysis population.

Use the same column titles for papers B and C. One may report only enrollment and another only analysis. Record the status to distinguish an empty cell from an unreported value. After review, test whether another reader can locate the same cell. A useful record includes **location and meaning**: "Paper A, Results, Table 2, analyzed population column, footnote checked."

## Further reading

- [What is RAG? (Korean)](/blog/rag-finetuning/what-is-rag/)
- [What is AI hallucination? (Korean)](/blog/aerini/what-is-hallucination/)
- [Research and academic topics (Korean)](/blog/topics/research/)
