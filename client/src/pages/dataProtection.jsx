import { ExternalLink, FileText, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const sections = [
    ["commitment", "Our commitment"],
    ["information", "Information we collect"],
    ["use", "How we use it"],
    ["security", "Security & providers"],
    ["rights", "Your rights"],
    ["retention", "Retention & changes"],
];

const DataProtection = () => {
    return (
        <div className="min-h-screen bg-[#080808] text-slate-200">
            <Navbar />
            <main>
                <header className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(239,191,4,0.16),_transparent_35%),linear-gradient(135deg,#111111_0%,#080808_65%)] px-5 pb-14 pt-20 sm:px-8 lg:px-12">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-8 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#EFBF04]">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EFBF04]/40 bg-[#EFBF04]/10">
                                <ShieldCheck size={20} aria-hidden="true" />
                            </span>
                            Trust & privacy
                        </div>
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Data protection <span className="text-[#EFBF04]">& privacy</span>
                            </h1>
                            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                                We respect your privacy and are committed to protecting the information that helps you prepare for your next interview.
                            </p>
                            <p className="mt-5 text-sm font-medium text-slate-400">
                                Last updated <span className="text-slate-200">September 2, 2026</span>
                            </p>
                        </div>
                    </div>
                </header>

                <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-16">
                    <aside className="lg:sticky lg:top-28 lg:self-start">
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">On this page</p>
                        <nav aria-label="Data protection sections" className="grid grid-cols-2 gap-x-5 gap-y-3 lg:block lg:space-y-3">
                            {sections.map(([id, label]) => (
                                <a key={id} href={`#${id}`} className="text-sm text-slate-400 transition-colors hover:text-[#EFBF04]">
                                    {label}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    <article className="max-w-3xl space-y-12 text-[15px] leading-8 text-slate-300 sm:text-base">
                        <section className="border-b border-white/10 pb-12">
                            <p>
                                InterviewWace is an AI-powered interview preparation platform designed to help job seekers prepare for interviews, improve their skills, and become more confident candidates. This page explains how we handle personal information and our commitment to the <strong className="font-semibold text-white">Data Protection Act, 2019 of Kenya</strong> and applicable regulations.
                            </p>
                        </section>

                        <section id="commitment" className="scroll-mt-28">
                            <SectionHeading number="01" title="Our commitment to data protection" />
                            <p>We handle personal information in a lawful, fair, transparent, and responsible manner. Our approach is guided by Kenya&apos;s Data Protection Act, 2019, including the principles of purpose limitation, data minimisation, accuracy, and security.</p>
                            <InfoList items={["What personal information we collect", "Why we collect and use it", "How we protect and retain it", "What rights you have regarding your information"]} />
                        </section>

                        <section id="information" className="scroll-mt-28">
                            <SectionHeading number="02" title="What personal information we collect" />
                            <p>Depending on how you use InterviewWace, we may collect information that is reasonably necessary to provide and improve the platform.</p>
                            <Subheading title="Account information" />
                            <InfoList items={["Email address", "Name or username, where provided", "Account information associated with your authentication provider"]} />
                            <Subheading title="Interview information" />
                            <InfoList items={["Job position, company, and job descriptions", "Interview questions and your answers", "Interview performance and feedback"]} />
                            <Subheading title="Technical information" />
                            <InfoList items={["Browser and device information", "IP address, login, and session information", "Usage information relating to the platform"]} />
                        </section>

                        <section id="use" className="scroll-mt-28">
                            <SectionHeading number="03" title="Why we collect your information" />
                            <p>We process personal information for specific and legitimate purposes, including to:</p>
                            <InfoList items={["Create and manage your account", "Provide interview preparation, questions, and feedback", "Save your progress and personalise your experience", "Process payments and send important service communications", "Improve platform performance and maintain security", "Detect abuse, fraud, or unauthorised activity", "Comply with applicable legal obligations"]} />
                            <p>We do not collect personal information simply because it is available. We aim to collect information that is relevant and necessary for the services we provide.</p>
                        </section>

                        <section className="rounded-2xl border border-[#EFBF04]/30 bg-[#EFBF04]/[0.07] p-6 sm:p-8">
                            <div className="flex gap-4">
                                <LockKeyhole className="mt-1 shrink-0 text-[#EFBF04]" size={24} aria-hidden="true" />
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Your email address</h2>
                                    <p className="mt-3">Your email may be used to create and authenticate your account, send service-related communications, respond to support requests, and share information about your use of InterviewWace. Your email address will not be sold or rented to third parties. Marketing communications include an appropriate way to opt out.</p>
                                </div>
                            </div>
                        </section>

                        <section id="security" className="scroll-mt-28">
                            <SectionHeading number="04" title="How we protect your information" />
                            <p>We take reasonable technical and organisational measures to protect personal information against unauthorised access, alteration, disclosure, loss, or misuse.</p>
                            <InfoList items={["Access controls and account security measures", "Secure communication technologies such as HTTPS", "Appropriate protection of application databases", "Restricted access for authorised parties", "Security monitoring and trusted service providers"]} />
                            <p>No internet-based service can guarantee absolute security. Users should understand that no method of transmission or electronic storage is completely secure.</p>
                            <Subheading title="Third-party service providers" />
                            <p>Trusted providers may assist with authentication, cloud hosting, database infrastructure, payments, email delivery, artificial intelligence, analytics, and security. We seek appropriate safeguards and require information to be handled only for legitimate service purposes. Where information is transferred outside Kenya, we take steps required by applicable Kenyan law.</p>
                        </section>

                        <section className="border-l-2 border-[#EFBF04] pl-6 sm:pl-8">
                            <h2 className="text-2xl font-semibold text-white">Artificial intelligence and your information</h2>
                            <p className="mt-4">Information submitted through AI-powered features may be processed to provide interview questions, simulations, answer analysis, and feedback. We aim to limit processing to what is reasonably necessary. Please avoid submitting highly sensitive personal information that is not needed for interview preparation.</p>
                        </section>

                        <section id="rights" className="scroll-mt-28">
                            <SectionHeading number="05" title="Your rights under Kenyan data protection law" />
                            <p>Under Kenya&apos;s Data Protection Act, 2019, users have the right to:</p>
                            <InfoList items={["Be informed about how their information is used", "Request access to information held about them", "Object to certain processing", "Request correction of inaccurate information", "Request deletion where provided by law", "Withdraw consent where processing is based on consent", "Exercise other rights provided by applicable law"]} />
                            <Subheading title="Withdrawing consent" />
                            <p>You may withdraw consent where processing is based on it. This does not affect processing that occurred before withdrawal. Deletion or withdrawal may affect services that need the relevant information to operate.</p>
                        </section>

                        <section id="retention" className="scroll-mt-28">
                            <SectionHeading number="06" title="Retention, responsibility, and changes" />
                            <p>We retain personal information only as long as reasonably necessary for the purposes for which it was collected, unless a longer period is required or permitted by law. When it is no longer necessary, we aim to securely delete, anonymise, or otherwise dispose of it appropriately.</p>
                            <Subheading title="Your responsibility" />
                            <InfoList items={["Keep your password and authentication information confidential", "Avoid sharing your account", "Avoid submitting unnecessary sensitive information", "Contact us if you believe your account was accessed without permission"]} />
                            <Subheading title="Children&apos;s privacy" />
                            <p>InterviewWace is intended for individuals who are legally able to use the service. If we become aware that a child&apos;s information was collected in circumstances requiring consent, we will take appropriate steps.</p>
                            <p>We may update this page to reflect changes to our services or applicable legal requirements. The date at the top indicates when it was most recently updated.</p>
                        </section>

                        <section className="grid gap-5 border-t border-white/10 pt-10 sm:grid-cols-2">
                            <div>
                                <Mail className="mb-4 text-[#EFBF04]" size={24} aria-hidden="true" />
                                <h2 className="text-2xl font-semibold text-white">Contact us</h2>
                                <p className="mt-3">For privacy questions or to exercise your rights, contact us through the contact details provided on the InterviewWace website. Please provide enough information for us to understand and respond to your request.</p>
                            </div>
                            <div>
                                <FileText className="mb-4 text-[#EFBF04]" size={24} aria-hidden="true" />
                                <h2 className="text-2xl font-semibold text-white">Learn more</h2>
                                <p className="mt-3">Learn more through the Office of the Data Protection Commissioner and the Data Protection Act and related regulations.</p>
                                <a href="https://www.odpc.go.ke/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold text-[#EFBF04] hover:text-white">Visit ODPC <ExternalLink size={16} aria-hidden="true" /></a>
                            </div>
                        </section>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const SectionHeading = ({ number, title }) => (
    <div className="mb-5 flex items-start gap-4">
        <span className="pt-1 text-xs font-bold tracking-[0.15em] text-[#EFBF04]">{number}</span>
        <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">{title}</h2>
    </div>
);

const Subheading = ({ title }) => <h3 className="mt-7 mb-2 text-lg font-semibold text-white">{title}</h3>;

const InfoList = ({ items }) => (
    <ul className="my-5 space-y-2 pl-1">
        {items.map((item) => (
            <li key={item} className="flex gap-3">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EFBF04]" aria-hidden="true" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

export default DataProtection;
