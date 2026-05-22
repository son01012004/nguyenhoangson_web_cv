import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CVData } from '../types';

interface CVContextType {
  cvs: CVData[];
  saveCV: (cv: CVData) => void;
  deleteCV: (id: string) => void;
  importCV: (jsonString: string) => boolean;
  getCV: (id: string) => CVData | undefined;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export function CVProvider({ children }: { children: React.ReactNode }) {
  const [cvs, setCvs] = useState<CVData[]>([]);

  // Tải dữ liệu từ local storage khi component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cv-hub-data');
      if (stored) setCvs(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load CVs from local storage', e);
    }
  }, []);

  // Lưu dữ liệu vào local storage mỗi khi state `cvs` thay đổi
  useEffect(() => {
    localStorage.setItem('cv-hub-data', JSON.stringify(cvs));
  }, [cvs]);

  const saveCV = (cv: CVData) => {
    setCvs((prev) => {
      const exists = prev.find((item) => item.id === cv.id);
      if (exists) {
        return prev.map((item) =>
          item.id === cv.id ? { ...cv, lastUpdated: new Date().toISOString() } : item
        );
      }
      return [...prev, { ...cv, lastUpdated: new Date().toISOString() }];
    });
  };

  const deleteCV = (id: string) => {
    setCvs((prev) => prev.filter((item) => item.id !== id));
  };

  const importCV = (jsonString: string): boolean => {
    try {
      const raw = JSON.parse(jsonString);
      let mappedCv: CVData | null = null;

      const generateId = () => Math.random().toString(36).substring(2, 9);

      const stripHtml = (htmlStr: string) => {
        if (!htmlStr) return [];
        const tmp = document.createElement('div');
        tmp.innerHTML = htmlStr;
        const lis = tmp.querySelectorAll('li');
        if (lis.length > 0) return Array.from(lis).map((li) => li.textContent || '');
        const ps = tmp.querySelectorAll('p');
        if (ps.length > 0) return Array.from(ps).map((p) => p.textContent || '');
        return [tmp.textContent || ''];
      };

      if (raw.personalInfo) {
        // Xử lý định dạng JSON loại 1
        mappedCv = {
          id: raw.id || generateId(),
          cvName: raw.cvName || raw.personalInfo?.name || 'Untitled CV',
          lastUpdated: raw.lastUpdated || new Date().toISOString(),
          personalInfo: {
            name: raw.personalInfo?.name || '',
            title: raw.personalInfo?.title || '',
            email: raw.personalInfo?.email || '',
            phone: raw.personalInfo?.phone || '',
            location: raw.personalInfo?.location || '',
            links: raw.personalInfo?.links || [],
            photo: raw.personalInfo?.photo,
          },
          summary: raw.summary || '',
          skills: {
            languages: raw.skills?.languages || [],
            tools: raw.skills?.tools || [],
            other: raw.skills?.other || [],
          },
          experience: (raw.experience || []).map((e: any) => ({
            id: e.id || generateId(),
            company: e.company || '',
            position: e.position || e.role || '',
            date: e.date || e.startDate || '',
            details: Array.isArray(e.details)
              ? e.details
              : e.bulletPoints
              ? Array.isArray(e.bulletPoints)
                ? e.bulletPoints
                : stripHtml(e.bulletPoints)
              : [],
          })),
          projects: (raw.projects || []).map((p: any) => ({
            id: p.id || generateId(),
            name: p.name || '',
            role: p.role || '',
            date: p.date || '',
            tech: p.tech || [],
            bulletPoints: Array.isArray(p.bulletPoints)
              ? p.bulletPoints
              : stripHtml(p.bulletPoints || p.description),
          })),
          education: (raw.education || []).map((e: any) => ({
            id: e.id || generateId(),
            school: e.school || e.institution || '',
            degree: e.degree || '',
            date: e.date || e.startDate || '',
            description: Array.isArray(e.description) ? e.description : stripHtml(e.description),
          })),
          certifications: (raw.certifications || raw.certificates || []).map((c: any) => ({
            id: c.id || generateId(),
            name: c.name || '',
            issuer: c.issuer || '',
            type: c.type || 'pdf',
            url: c.url || '',
          })),
        };
      } else if (raw.basic) {
        // Xử lý định dạng JSON loại 2
        const getItemsForSection = (sectionId: string) => {
          let items: any[] = [];
          if (sectionId === 'education') items = raw.education || [];
          else if (sectionId === 'experience') items = raw.experience || [];
          else if (sectionId === 'projects') items = raw.projects || [];
          else if (sectionId === 'certificates') items = raw.certificates || [];
          else if (raw.customData && raw.customData[sectionId]) items = raw.customData[sectionId];

          return items
            .filter((item: any) => item.visible !== false)
            .map((item: any) => ({
              id: item.id || generateId(),
              title: item.school || item.company || item.name || item.title || '',
              subtitle: item.degree || item.position || item.role || item.subtitle || '',
              date:
                item.date ||
                item.dateRange ||
                (item.startDate ? `${item.startDate} - ${item.endDate || ''}` : ''),
              htmlContent: item.description || item.details || item.skillContent || '',
              url: item.url || '',
              type: item.type || '',
            }));
        };

        const parsedSections = (raw.menuSections || [])
          .filter((sec: any) => sec.enabled !== false && sec.id !== 'basic')
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((sec: any) => ({
            id: sec.id,
            title: sec.title,
            items: getItemsForSection(sec.id),
          }));

        if (raw.skillContent) {
          parsedSections.push({
            id: 'skills_explicit',
            title: 'Skills',
            items: [{ id: 'skills_1', title: '', htmlContent: raw.skillContent }],
          });
        }

        mappedCv = {
          id: raw.id || generateId(),
          cvName: raw.title || raw.basic?.name || 'Untitled CV',
          lastUpdated: raw.updatedAt || new Date().toISOString(),
          personalInfo: {
            name: raw.basic?.name || '',
            title: raw.basic?.title || '',
            email: raw.basic?.email || '',
            phone: raw.basic?.phone || '',
            location: raw.basic?.location || '',
            photo: raw.basic?.photo || '',
            links:
              raw.basic?.customFields
                ?.filter((f: any) => f.visible)
                .map((f: any) => ({ label: f.label, url: f.value })) || [],
          },
          sections: parsedSections,
        };
      }

      // Xác thực dữ liệu
      if (!mappedCv || !mappedCv.personalInfo?.name) {
        return false;
      }

      saveCV(mappedCv);
      return true;
    } catch (e) {
      console.error('Invalid JSON', e);
      return false;
    }
  };

  const getCV = (id: string) => {
    return cvs.find((cv) => cv.id === id);
  };

  return (
    <CVContext.Provider value={{ cvs, saveCV, deleteCV, importCV, getCV }}>
      {children}
    </CVContext.Provider>
  );
}

export function useCVs() {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error('useCVs must be used within a CVProvider');
  }
  return context;
}