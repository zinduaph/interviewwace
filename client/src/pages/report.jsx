import { useState } from 'react'
import axios from 'axios'
import { FileText, Upload, LoaderCircle, CheckCircle, AlertCircle, ChevronDown, Download } from 'lucide-react'
import { useUser } from '@clerk/react'
import Navbar from '../components/navbar'
import { backendUrl } from '../App'

const inputClassName = 'w-full rounded-lg border border-gray-700 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#EFBF04]'
const hiddenReportSections = new Set(['overallAssessment', 'emphasize', 'likelyQuestions', 'behavioralQuestions', 'companyPreparation', 'questionsToAskEmployer'])

const Report = () => {
    const { user, isLoaded } = useUser()
    const [form, setForm] = useState({
        company: '',
        position: '',
        jobDescription: ''
    })
    const [cv, setCv] = useState(null)
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [expandedSection, setExpandedSection] = useState(null)

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (!user) {
            setError('Please sign in before creating a report.')
            return
        }

        if (!cv) {
            setError('Please choose your CV before submitting.')
            return
        }

        const formData = new FormData()
        formData.append('cv', cv)
        formData.append('company', form.company)
        formData.append('position', form.position)
        formData.append('jobDescription', form.jobDescription)
        formData.append('clerkId', user.id)

        setLoading(true)
        try {
            const response = await axios.post(
                `${backendUrl}/api/practice/upload-cv`,
                formData
            )
            console.log(response)
            setReport(response.data.practice?.report || null)
            setExpandedSection(null)
            console.log(setReport)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to create your report. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        const reportLines = [
            'INTERVIEW PREPARATION REPORT',
            `Company: ${form.company}`,
            `Position: ${form.position}`,
            '',
            'READINESS ASSESSMENT',
            `Score: ${report.overallAssessment?.readinessScore ?? 0}/100`,
            report.overallAssessment?.summary || '',
            '',
            ...getVisibleReportEntries(report)
                .map(([section, value]) => `${formatLabel(section).toUpperCase()}\n${formatReportValue(value)}`)
        ].join('\n').split('\n').flatMap((line) => wrapReportLine(line, 92))

        const blob = createPdfBlob(reportLines)
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${form.position || 'interview'}-report.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(downloadUrl)
    }

    if (!isLoaded) {
        return <div className="flex min-h-screen items-center justify-center bg-black"><LoaderCircle className="animate-spin text-[#EFBF04]" size={40} /></div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <main className="flex min-h-[70vh] items-center justify-center px-4 text-center">
                    <div>
                        <AlertCircle className="mx-auto mb-4 text-[#EFBF04]" size={42} />
                        <h1 className="text-3xl font-bold">Sign In Required</h1>
                        <p className="mt-3 text-gray-400">Please sign in to create your interview report.</p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-8">
                <div className="mb-10 max-w-2xl">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EFBF04]">AI career preparation</p>
                    <h1 className="text-3xl font-bold md:text-5xl">Build your interview report</h1>
                    <p className="mt-4 text-lg text-gray-400">Upload your CV and get preparation tailored to the role, company, and your experience.</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-800 bg-[#1a1a1a] p-6 md:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFBF04] text-black"><FileText size={22} /></div>
                            <div>
                                <h2 className="text-xl font-semibold">Role details</h2>
                                <p className="text-sm text-gray-400">Tell us what you are preparing for.</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <label className="block text-sm font-medium text-gray-300">Company
                                <input className={`${inputClassName} mt-2`} name="company" value={form.company} onChange={handleChange} placeholder="e.g. Safaricom" required />
                            </label>
                            <label className="block text-sm font-medium text-gray-300">Position
                                <input className={`${inputClassName} mt-2`} name="position" value={form.position} onChange={handleChange} placeholder="e.g. Graduate Trainee" required />
                            </label>
                            <label className="block text-sm font-medium text-gray-300">Job description
                                <textarea className={`${inputClassName} mt-2 min-h-36 resize-y`} name="jobDescription" value={form.jobDescription} onChange={handleChange} placeholder="Paste the job description here" required />
                            </label>
                            <label className="block cursor-pointer text-sm font-medium text-gray-300">CV file
                                <span className="mt-2 flex min-h-28 items-center justify-center rounded-lg border border-dashed border-gray-600 bg-[#111111] px-4 text-center transition hover:border-[#EFBF04]">
                                    <span>{cv ? <><CheckCircle className="mr-2 inline text-green-400" size={18} />{cv.name}</> : <><Upload className="mr-2 inline text-[#EFBF04]" size={18} />Choose a PDF or DOCX file</>}</span>
                                    <input className="sr-only" type="file" name="cv" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setCv(event.target.files?.[0] || null)} required />
                                </span>
                            </label>
                        </div>

                        {error && <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
                        <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#EFBF04] px-5 py-3 font-semibold text-black transition hover:bg-[#d4a700] disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? <><LoaderCircle className="animate-spin" size={19} />Creating report...</> : <><Upload size={19} />Create interview report</>}
                        </button>
                    </form>

                    <section className="rounded-2xl border border-gray-800 bg-[#111111] p-6 md:p-8">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-xl font-semibold text-[#EFBF04]">Your report</h2>
                            {report && <button type="button" onClick={handleDownload} className="flex shrink-0 items-center gap-2 rounded-lg border border-[#EFBF04] px-3 py-2 text-sm font-semibold text-[#EFBF04] transition hover:bg-[#EFBF04] hover:text-black"><Download size={17} />Download</button>}
                        </div>
                        {!report ? (
                            <div className="flex min-h-80 items-center justify-center text-center text-gray-500"><p>Your tailored report will appear here after your CV is analyzed.</p></div>
                        ) : (
                            <div className="mt-6 space-y-6">
                                <div className="rounded-xl border border-[#EFBF04]/30 bg-[#EFBF04]/10 p-5">
                                    <p className="text-sm text-gray-300">Readiness score</p>
                                    <p className="mt-1 text-4xl font-bold text-[#EFBF04]">{report.overallAssessment?.readinessScore ?? 0}/100</p>
                                    <p className="mt-3 text-gray-300">{report.overallAssessment?.summary}</p>
                                </div>
                                <div className="sticky top-24 z-10 -mx-2 rounded-xl border border-gray-800 bg-[#111111]/95 p-2 backdrop-blur">
                                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Jump to a section</p>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {getVisibleReportEntries(report)
                                            .map(([section]) => (
                                                <button
                                                    key={section}
                                                    type="button"
                                                    onClick={() => setExpandedSection(section)}
                                                    className="shrink-0 rounded-lg border border-gray-700 px-3 py-2 text-left text-sm text-gray-300 transition hover:border-[#EFBF04] hover:text-[#EFBF04]"
                                                >
                                                    {formatLabel(section)}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {getVisibleReportEntries(report)
                                        .map(([section, value]) => (
                                            <ReportSection
                                                key={section}
                                                title={formatLabel(section)}
                                                value={value}
                                                expanded={expandedSection === section}
                                                onToggle={() => setExpandedSection((current) => current === section ? null : section)}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    )
}

const formatLabel = (value) => value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (letter) => letter.toUpperCase())

const getVisibleReportEntries = (report) => Object.entries(report)
    .filter(([section]) => !hiddenReportSections.has(section))

const wrapReportLine = (line, maxLength) => {
    if (!line) return ['']

    const words = line.split(' ')
    const lines = []
    let currentLine = ''

    words.forEach((word) => {
        if (`${currentLine} ${word}`.trim().length > maxLength && currentLine) {
            lines.push(currentLine)
            currentLine = word
        } else {
            currentLine = `${currentLine} ${word}`.trim()
        }
    })

    if (currentLine) lines.push(currentLine)
    return lines
}

const createPdfBlob = (lines) => {
    const linesPerPage = 44
    const pages = []
    for (let index = 0; index < lines.length; index += linesPerPage) {
        pages.push(lines.slice(index, index + linesPerPage))
    }

    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        `<< /Type /Pages /Kids [${pages.map((_, index) => `${4 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    ]

    pages.forEach((pageLines, pageIndex) => {
        const pageObjectNumber = 4 + pageIndex * 2
        const contentObjectNumber = pageObjectNumber + 1
        const content = [
            'BT',
            '/F1 11 Tf',
            '50 760 Td',
            ...pageLines.map((line, lineIndex) => `(${escapePdfText(line)}) Tj${lineIndex < pageLines.length - 1 ? ' 0 -16 Td' : ''}`),
            'ET'
        ].join('\n')

        objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`)
        objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    })

    let pdf = '%PDF-1.4\n'
    const offsets = [0]
    objects.forEach((object, index) => {
        offsets.push(new TextEncoder().encode(pdf).length)
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
    })

    const crossReferenceOffset = new TextEncoder().encode(pdf).length
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`

    return new Blob([pdf], { type: 'application/pdf' })
}

const escapePdfText = (value) => value
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[\\()]/g, '\\$&')

const formatReportValue = (value, indent = '') => {
    if (Array.isArray(value)) {
        return value.map((item, index) => `${indent}${index + 1}. ${formatReportValue(item, `${indent}   `)}`).join('\n')
    }

    if (value && typeof value === 'object') {
        return Object.entries(value)
            .map(([key, item]) => `${indent}${formatLabel(key)}: ${formatReportValue(item, `${indent}  `)}`)
            .join('\n')
    }

    return `${value ?? 'Not provided'}`
}

const ReportSection = ({ title, value, expanded, onToggle }) => (
    <section className="overflow-hidden rounded-xl border border-gray-800 bg-[#151515]">
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-[#1c1c1c]">
            <span className="text-lg font-semibold text-[#EFBF04]">{title}</span>
            <ChevronDown className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} size={20} />
        </button>
        {expanded && <div className="border-t border-gray-800 px-4 py-5"><ReportValue value={value} /></div>}
    </section>
)

const ReportValue = ({ value }) => {
    if (Array.isArray(value)) {
        return (
            <div className="space-y-4">
                {value.map((item, index) => (
                    <div key={index} className="border-l-2 border-[#EFBF04] pl-4">
                        <p className="mb-2 text-sm font-semibold text-gray-500">{index + 1}</p>
                        <ReportValue value={item} />
                    </div>
                ))}
            </div>
        )
    }

    if (value && typeof value === 'object') {
        return (
            <div className="space-y-3">
                {Object.entries(value).map(([key, item]) => (
                    <div key={key} className="break-words">
                        <p className="text-sm font-medium text-gray-300">{formatLabel(key)}</p>
                        <div className="mt-1 text-sm leading-6 text-gray-400"><ReportValue value={item} /></div>
                    </div>
                ))}
            </div>
        )
    }

    return <p>{value ?? 'Not provided'}</p>
}

export default Report