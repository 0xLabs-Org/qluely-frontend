Qluely Onboarding UI Flow — Role & Use Case Step
Goal

Collect personalization data without blocking user progress.

Screen Title

“Help us personalize Qluely for you”
Subtext: You can skip this anytime

Section 1 — Role Selection

Question
What best describes your role?

UI Component
Radio cards / selectable tiles

Options

Founder / CEO

Product Manager

Engineer

Recruiter / HR

Sales / Marketing

Student

Other

Behavior

Single select

Optional

Highlight selected option
Section 2 — Primary Use Case

Question
Primary use case for Qluely?

UI Component

Selectable cards (single or multi-select if needed)

Options

Meetings & summaries

Interviews

Sales calls

Team standups

Client calls

Other

Footer Actions

Left Button
Skip for now

Right Button
Continue →

UX Behavior Rules
If user selects answers:

Save preferences

Continue to next onboarding step

If user skips:

Save as null

Use default personalization

Continue without blocking

---

Help us personalize Qluely for you
You can skip this anytime

What best describes your role?
[ Founder / CEO ]
[ Product Manager ]
[ Engineer ]
[ Recruiter / HR ]
[ Sales / Marketing ]
[ Student ]

Primary use case for Qluely?
[ Meetings & summaries ]
[ Interviews ]
[ Sales calls ]
[ Team standups ]
[ Client calls ]

## [ Skip for now ] [ Continue → ]

Example State Payload (If Answered)
{
"role": "Engineer",
"primaryUseCase": "Meetings & summaries"
}
Example Payload (If Skipped)
{
"role": null,
"primaryUseCase": null,
"skipped": true
}

Smart Behavior After Selection (Recommended)
Engineer → prioritize:

Technical summaries

Concise tone

Recruiter → prioritize:

Interview insights

Candidate feedback

Sales → prioritize:

Objections

Deal risks

Action items
