import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useCVs } from '../store/CVContext';
import { CVData, Certification } from '../types';
import LZString from 'lz-string';
import { ArrowLeft, Printer, Palette, ExternalLink, Image as ImageIcon, FileText, Download, Mail, Phone, MapPin, Link as LinkIcon, Calendar, Briefcase, GraduationCap, Wrench, Award, LayoutTemplate, Layers, LayoutDashboard, FileText as FileTextIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Viewer() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getCV } = useCVs();
  
  const [cv, setCv] = useState<CVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light-futuristic' | 'dark-tech' | 'glass-minimal' | string>('dark-tech');
  
  // Đã thiết lập mặc định luôn là 'bento'
  const [layoutMode, setLayoutMode] = useState<'a4' | 'bento'>('bento');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('cv-hub-theme');
    const validThemes = ['light-futuristic', 'dark-tech', 'glass-minimal'];
    if (savedTheme && validThemes.includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cv-hub-theme', theme);
  }, [theme]);

  useEffect(() => {
    const hash = window.location.hash;
    const hashData = hash.startsWith('#data=') ? hash.replace('#data=', '') : null;
    const queryData = searchParams.get('data');
    const compressedData = hashData || queryData;

    if (compressedData) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
        if (decompressed) {
          setCv(JSON.parse(decompressed));
        } else {
          setError("Failed to load shared CV. Link might be corrupted.");
        }
      } catch (e) {
        setError("Failed to parse shared CV.");
      }
    } else if (id) {
      const found = getCV(id);
      if (found) {
        setCv(found);
      } else {
        setError("CV not found in your local storage.");
      }
    } else {
      setError("No CV data found in URL.");
    }
  }, [id, searchParams, getCV]);

  const handlePrint = () => {
    window.print();
  };

  const cycleTheme = () => {
    const themes = ['light-futuristic', 'dark-tech', 'glass-minimal'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex] as any);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-8 rounded-xl border border-red-200 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-muted mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative text-foreground pb-20 print:bg-white print:text-black">
      {/* Màn lưới background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 print:hidden" 
           style={{ 
             backgroundImage: 'linear-gradient(to right, var(--border-color) 1px, transparent 1px), linear-gradient(to bottom, var(--border-color) 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
             WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
           }}>
      </div>
      
      {/* Menu nổi */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none print:hidden">
        <button 
          onClick={() => navigate('/')}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-md border border-border rounded-full shadow-sm hover:bg-background transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="pointer-events-auto flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border rounded-full p-1 shadow-sm">
          <button 
            onClick={() => setLayoutMode(l => l === 'a4' ? 'bento' : 'a4')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-background transition-all"
            title="Toggle Layout"
          >
            {layoutMode === 'bento' ? <FileTextIcon className="w-4 h-4 flex-shrink-0" /> : <LayoutDashboard className="w-4 h-4 flex-shrink-0" />}
            <span className="text-sm font-medium hidden sm:inline-block">
              {layoutMode === 'bento' ? 'A4 View' : 'Bento View'}
            </span>
          </button>
          <div className="w-px h-4 bg-border"></div>
          <button 
            onClick={cycleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-background transition-all max-w-[120px] sm:max-w-none"
            title="Toggle Theme"
          >
            <Palette className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium capitalize truncate hidden sm:inline-block">{theme}</span>
          </button>
          <div className="w-px h-4 bg-border"></div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-background transition-all"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium hidden sm:inline-block">Print</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn("relative z-10 mx-auto mt-24 print:mt-0 px-4 sm:px-8 pb-12 transition-all duration-500", layoutMode === 'bento' ? "max-w-7xl" : "max-w-4xl")}>
        <div className={cn("transition-all duration-500 relative", layoutMode === 'bento' ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "theme-card bg-card print:bg-white print:border-none border border-border shadow-md overflow-hidden backdrop-blur-md")}>
          {layoutMode === 'a4' && <div className="absolute top-0 left-0 right-0 h-2 bg-primary/80"></div>}
          
          {/* HEADER CHÍNH ĐÃ FIX LAYOUT */}
          <header className={cn("relative overflow-hidden", layoutMode === 'bento' ? "theme-card bg-card p-6 sm:p-8 lg:col-span-4 lg:sticky lg:top-24 border border-border/60 shadow-lg backdrop-blur-xl" : "p-8 sm:p-12 sm:pb-10 border-b border-border/50")}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_8px_rgba(var(--color-primary),0.8)] animate-[scan_3s_ease-in-out_infinite] print:hidden"></div>
            
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className={cn(
              "flex relative z-10",
              layoutMode === 'bento' 
                ? "flex-col-reverse items-center text-center lg:items-start lg:text-left gap-6 lg:gap-8" 
                : "flex-col-reverse sm:flex-row justify-between items-center sm:items-start gap-8"
            )}>
              <div className={cn("flex-1", layoutMode === 'bento' ? "w-full" : "")}>
                <h1 className={cn(
                  "font-extrabold tracking-tight text-foreground print:text-black pb-1",
                  layoutMode === 'bento' ? "text-3xl sm:text-4xl xl:text-5xl" : "text-4xl sm:text-5xl"
                )}>
                  {cv.personalInfo.name}
                </h1>
                <h2 className={cn(
                  "mt-1 font-medium text-primary print:text-gray-800",
                  layoutMode === 'bento' ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
                )}>
                  {cv.personalInfo.title}
                </h2>
                
                <div className={cn(
                  "flex flex-wrap gap-x-6 gap-y-3 mt-6 text-sm text-muted print:text-gray-600",
                  layoutMode === 'bento' ? "justify-center lg:justify-start" : ""
                )}>
                  {cv.personalInfo.email && (
                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                      <Mail className="w-4 h-4 text-primary/70" />
                      {cv.personalInfo.email}
                    </span>
                  )}
                  {cv.personalInfo.phone && (
                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                      <Phone className="w-4 h-4 text-primary/70" />
                      {cv.personalInfo.phone}
                    </span>
                  )}
                  {cv.personalInfo.location && (
                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                      <MapPin className="w-4 h-4 text-primary/70" />
                      {cv.personalInfo.location}
                    </span>
                  )}
                  {cv.personalInfo.links?.map((link, idx) => (
                    <a key={idx} href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors text-muted">
                      <LinkIcon className="w-4 h-4 text-primary/70 print:hidden" />
                      {link.label || link.url.replace(/^https?:\/\//, '')}
                    </a>
                  ))}
                </div>
              </div>
              
              {/* PHẦN ẢNH ĐÃ FIX TỶ LỆ CHUẨN (ASPECT 3:4) */}
              {cv.personalInfo.photo && (
                <div className={cn(
                  "relative group flex-shrink-0",
                  layoutMode === 'bento' ? "w-32 sm:w-44 aspect-[3/4]" : "w-28 sm:w-36 aspect-[3/4]"
                )}>
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors duration-500"></div>
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border border-primary/20 shadow-[0_0_15px_rgba(var(--color-primary),0.15)] bg-card">
                    <img 
                      src={cv.personalInfo.photo} 
                      alt={cv.personalInfo.name} 
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-primary/20 rounded-2xl pointer-events-none"></div>
                    {/* Tech corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/60 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/60 pointer-events-none"></div>
                  </div>
                </div>
              )}
            </div>
            
            {cv.summary && (
              <div className="mt-8 p-5 sm:p-6 bg-muted/5 border-l-4 border-primary rounded-r-xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <p className="text-base leading-relaxed text-muted print:text-black relative z-10">
                  {cv.summary}
                </p>
              </div>
            )}
          </header>

          {/* DYNAMIC SECTIONS */}
          <div className={cn("", layoutMode === 'bento' ? "lg:col-span-8 space-y-6" : "p-8 sm:p-12 space-y-12")}>
            {cv.sections && cv.sections.map((section) => {
              let SectionIcon = Layers;
              if (section.id.toLowerCase().includes('experience')) SectionIcon = Briefcase;
              if (section.id.toLowerCase().includes('education')) SectionIcon = GraduationCap;
              if (section.id.toLowerCase().includes('project')) SectionIcon = LayoutTemplate;
              if (section.id.toLowerCase().includes('cert')) SectionIcon = Award;
              if (section.id.toLowerCase().includes('skill')) SectionIcon = Wrench;

              return section.items.length > 0 && (
                <section key={section.id} className={cn(layoutMode === 'bento' ? "theme-card bg-card p-6 sm:p-8 border border-border shadow-sm backdrop-blur-md" : "")}>
                  <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                    <span className="relative flex items-center justify-center bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-[0_0_10px_rgba(var(--color-primary),0)] group-hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)]">
                      <SectionIcon className="w-5 h-5 relative z-10" />
                      <div className="absolute inset-0 border border-primary/30 rounded-lg group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    </span>
                    <span className="uppercase text-sm tracking-widest font-mono text-primary/90">{section.title}</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent ml-4 print:bg-gray-300"></div>
                  </h3>
                  <div className="space-y-8">
                    {section.items.map((item) => (
                      <div key={item.id} className="relative pl-4 sm:pl-0">
                        <div className="absolute left-0 top-2 bottom-0 w-px bg-border sm:hidden"></div>
                        
                        {(item.title || item.subtitle || item.date) && (
                          <div className="mb-2 relative">
                            <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-background sm:hidden"></div>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                              <h4 className="text-lg font-semibold text-foreground">
                                {item.title} 
                                {item.title && item.subtitle && <span className="mx-2 text-muted/50 hidden sm:inline">|</span>}
                                {item.subtitle && <span className={cn(item.title ? "text-base font-normal text-muted" : "text-lg font-medium text-foreground")}>{item.subtitle}</span>}
                              </h4>
                              {item.date && (
                                <span className="text-sm text-primary font-medium tabular-nums whitespace-nowrap mt-1 sm:mt-0 flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-md w-fit">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {item.date}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {item.htmlContent && (
                          <div 
                            className="cv-html-content text-muted text-sm leading-relaxed print:text-black mt-2" 
                            dangerouslySetInnerHTML={{ __html: item.htmlContent }} 
                          />
                        )}
                        
                        {item.url && item.type && (
                          <div className="mt-4 print:hidden">
                            {item.type.toLowerCase() === 'image' || item.url.match(/\.(jpeg|jpg|gif|png|svg)(\?.*)?$/i) ? (
                              <a href={item.url} target="_blank" rel="noreferrer" className="block w-fit rounded-md overflow-hidden border border-[#E5E7EB]">
                                <img 
                                  src={item.url} 
                                  alt={item.title || 'Certificate'} 
                                  className="w-full max-h-[120px] object-cover hover:scale-105 transition-transform duration-300" 
                                  loading="lazy" 
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="p-4 text-sm font-medium text-muted bg-muted/20">Preview not available. Click to view.</div>');
                                  }}
                                />
                              </a>
                            ) : item.type.toLowerCase() === 'pdf' || item.url.toLowerCase().includes('.pdf') ? (
                              <div className="w-full max-w-3xl border border-border rounded-md overflow-hidden bg-muted/10 relative group">
                                <iframe 
                                  src={item.url} 
                                  className="w-full h-[300px]" 
                                  loading="lazy" 
                                  title={item.title || 'PDF Document'}
                                >
                                  <p className="p-4 text-sm text-muted">Preview not available. <a href={item.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Download PDF</a></p>
                                </iframe>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur border border-border rounded-md shadow-sm text-sm font-medium hover:bg-background">
                                    <ExternalLink className="w-4 h-4" />
                                    Open
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium hover:bg-primary/20 transition-colors">
                                <ExternalLink className="w-4 h-4" />
                                View Attached Document
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Legacy Fallbacks below for older templates without `sections` array */}
            {(!cv.sections || cv.sections.length === 0) && cv.experience && cv.experience.length > 0 && (
              <section className={cn(layoutMode === 'bento' ? "theme-card bg-card p-6 sm:p-8 border border-border shadow-sm backdrop-blur-md" : "")}>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="relative flex items-center justify-center bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-[0_0_10px_rgba(var(--color-primary),0)] group-hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)]">
                    <Briefcase className="w-5 h-5 relative z-10" />
                    <div className="absolute inset-0 border border-primary/30 rounded-lg group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </span>
                  <span className="uppercase text-sm tracking-widest font-mono text-primary/90">Experience</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="space-y-8">
                  {cv.experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex flex-col sm:flex-row justify-between mb-2 sm:items-baseline">
                        <h4 className="text-lg font-medium text-foreground">{exp.position}</h4>
                        <span className="text-sm text-muted tabular-nums whitespace-nowrap hidden sm:block">
                          {exp.date}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between mb-3 text-primary font-medium text-sm print:text-gray-700 sm:hidden">
                        <span>{exp.company}</span>
                        <span className="text-xs">{exp.date}</span>
                      </div>
                      <div className="hidden sm:block text-primary font-medium text-sm mb-3">{exp.company}</div>
                      
                      <ul className="list-disc list-outside ml-4 text-muted text-sm leading-relaxed whitespace-pre-line print:text-black space-y-1.5">
                        {exp.details?.map((detail, idx) => (
                          <li key={idx} className="pl-1">{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(!cv.sections || cv.sections.length === 0) && cv.projects && cv.projects.length > 0 && (
              <section className={cn(layoutMode === 'bento' ? "theme-card bg-card p-6 sm:p-8 border border-border shadow-sm backdrop-blur-md" : "")}>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="relative flex items-center justify-center bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-[0_0_10px_rgba(var(--color-primary),0)] group-hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)]">
                    <LayoutTemplate className="w-5 h-5 relative z-10" />
                    <div className="absolute inset-0 border border-primary/30 rounded-lg group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </span>
                  <span className="uppercase text-sm tracking-widest font-mono text-primary/90">Projects</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="space-y-8">
                  {cv.projects.map(proj => (
                    <div key={proj.id} className="group relative p-5 sm:p-6 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-[0_4px_24px_-8px_rgba(var(--color-primary),0.2)] hover:scale-[1.02] transition-all duration-300">
                      <div className="flex flex-col sm:flex-row justify-between mb-3 sm:items-baseline">
                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {proj.name} 
                          {proj.role && <span className="text-muted font-normal text-base ml-2">| {proj.role}</span>}
                        </h4>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full tabular-nums whitespace-nowrap mt-2 sm:mt-0 w-fit">
                          {proj.date}
                        </span>
                      </div>
                      
                      {proj.tech && proj.tech.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 mt-2">
                          {proj.tech.map((t, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-background border border-border/60 text-muted rounded-full text-xs font-semibold print:bg-transparent print:border print:border-gray-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <ul className="list-disc list-outside ml-4 text-muted text-sm leading-relaxed whitespace-pre-line print:text-black space-y-2 mt-4 marker:text-primary/50">
                        {proj.bulletPoints?.map((point, idx) => (
                          <li key={idx} className="pl-1">{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(!cv.sections || cv.sections.length === 0) && cv.education && cv.education.length > 0 && (
              <section className={cn(layoutMode === 'bento' ? "theme-card bg-card p-6 sm:p-8 border border-border shadow-sm backdrop-blur-md" : "")}>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="relative flex items-center justify-center bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-[0_0_10px_rgba(var(--color-primary),0)] group-hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)]">
                    <GraduationCap className="w-5 h-5 relative z-10" />
                    <div className="absolute inset-0 border border-primary/30 rounded-lg group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </span>
                  <span className="uppercase text-sm tracking-widest font-mono text-primary/90">Education</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="space-y-6">
                  {cv.education.map(edu => (
                    <div key={edu.id}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-1">
                        <h4 className="text-base font-medium text-foreground">{edu.degree}</h4>
                        <span className="text-sm text-muted tabular-nums whitespace-nowrap">
                          {edu.date}
                        </span>
                      </div>
                      <div className="text-primary font-medium text-sm print:text-gray-700">{edu.school}</div>
                      
                      {edu.description && edu.description.length > 0 && (
                        <ul className="list-disc list-outside ml-4 mt-2 text-muted text-sm leading-relaxed whitespace-pre-line print:text-black space-y-1">
                          {edu.description.map((desc, idx) => (
                            <li key={idx} className="pl-1">{desc}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(!cv.sections || cv.sections.length === 0) && cv.skills && (cv.skills.languages?.length > 0 || cv.skills.tools?.length > 0) && (
              <section className={cn(layoutMode === 'bento' ? "theme-card bg-card p-6 sm:p-8 border border-border shadow-sm backdrop-blur-md" : "")}>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="relative flex items-center justify-center bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-[0_0_10px_rgba(var(--color-primary),0)] group-hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)]">
                    <Wrench className="w-5 h-5 relative z-10" />
                    <div className="absolute inset-0 border border-primary/30 rounded-lg group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </span>
                  <span className="uppercase text-sm tracking-widest font-mono text-primary/90">Skills</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="space-y-4">
                  {cv.skills.languages && cv.skills.languages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Languages</h4>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {cv.skills.languages.map((skill, index) => (
                          <span key={index} className="px-3.5 py-1.5 bg-background border border-border/70 rounded-full text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_rgba(var(--color-primary),0.15)] transition-all cursor-default print:bg-transparent print:border-gray-400 print:text-black">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {cv.skills.tools && cv.skills.tools.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">Tools & Technologies</h4>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {cv.skills.tools.map((skill, index) => (
                          <span key={index} className="px-3.5 py-1.5 bg-background border border-border/70 rounded-full text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_rgba(var(--color-primary),0.15)] transition-all cursor-default print:bg-transparent print:border-gray-400 print:text-black">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {cv.skills.other && cv.skills.other.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Other</h4>
                      <div className="flex flex-wrap gap-2">
                        {cv.skills.other.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-background border border-border rounded-md text-sm font-medium text-foreground print:bg-transparent print:border-gray-400 print:text-black">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {(!cv.sections || cv.sections.length === 0) && cv.certifications && cv.certifications.length > 0 && (
              <section className={cn(layoutMode === 'bento' ? "theme-card bg-card p-6 sm:p-8 border border-border shadow-sm backdrop-blur-md" : "")}>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="relative flex items-center justify-center bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-[0_0_10px_rgba(var(--color-primary),0)] group-hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)]">
                    <Award className="w-5 h-5 relative z-10" />
                    <div className="absolute inset-0 border border-primary/30 rounded-lg group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </span>
                  <span className="uppercase text-sm tracking-widest font-mono text-primary/90">Certifications</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cv.certifications.map(cert => (
                    <CertificationItem key={cert.id} cert={cert} />
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

const CertificationItem: React.FC<{ cert: Certification }> = ({ cert }) => {
  const isImage = cert.type === 'image' || (cert.url && cert.url.match(/\.(jpeg|jpg|gif|png|svg)(\?.*)?$/i));
  const isPdf = cert.type === 'pdf' || (cert.url && cert.url.toLowerCase().includes('.pdf'));

  return (
    <div className="flex flex-col gap-2 p-4 border border-border rounded-xl bg-background shadow-sm print:border-gray-300 print:bg-transparent">
      <div>
        <h4 className="text-sm font-medium text-foreground">{cert.name}</h4>
        <p className="text-xs text-muted mb-1">{cert.issuer}</p>
      </div>
      {cert.url && (
        <div className="mt-2 print:hidden">
          {isImage ? (
            <a href={cert.url} target="_blank" rel="noreferrer" className="block w-fit rounded-md overflow-hidden border border-[#E5E7EB]">
              <img 
                src={cert.url} 
                alt={cert.name} 
                className="w-full max-h-[120px] object-cover hover:scale-105 transition-transform duration-300" 
                loading="lazy" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="p-4 text-sm font-medium text-muted bg-muted/20">Preview not available. Click to view.</div>');
                }}
              />
            </a>
          ) : isPdf ? (
            <div className="w-full border border-border rounded-md overflow-hidden bg-muted/10 relative group">
              <iframe 
                src={cert.url} 
                className="w-full h-[300px]" 
                loading="lazy" 
                title={cert.name}
              >
                <p className="p-4 text-sm text-muted">Preview not available. <a href={cert.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Download PDF</a></p>
              </iframe>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={cert.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur border border-border rounded-md shadow-sm text-sm font-medium hover:bg-background">
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </div>
            </div>
          ) : (
            <a href={cert.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-1 text-sm text-primary hover:underline">
              <ExternalLink className="w-3 h-3" />
              View Certificate
            </a>
          )}
        </div>
      )}
    </div>
  );
}