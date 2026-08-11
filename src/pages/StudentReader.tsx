import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBookById } from '../api/books';
import { getBookReadingProgress, saveBookReadingProgress } from '../api/student';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  Type,
  List,
} from 'lucide-react';
import clsx from 'clsx';

// Multi-chapter mock generator for books in catalog
const getBookChapters = (title: string, author: string, category: string) => [
  {
    title: 'Chapter 1: The Threshold of Discovery',
    content: `The morning mist hung low over the courtyard of Oraculum as the sun began its gradual ascent. For generations, seekers of truth and scholars of distinction have walked these quiet halls, driven by an unyielding desire to understand the fundamental laws that shape human thought and literature.\n\nIn "${title}", ${author} sets forth a compelling thesis that challenges conventional assumptions in ${category}. Every sentence is crafted with intentionality, inviting the reader to look beyond surface observations and delve into deeper structures of meaning.\n\nAs we begin this study, notice how the central motif establishes the atmosphere. The text acts not merely as a repository of static knowledge, but as a living dialogue between author and reader.`,
  },
  {
    title: 'Chapter 2: Principles & Perspectives',
    content: `To grasp the core framework presented in "${title}", one must first examine the historical context from which it emerged. Throughout ${category}, key paradigm shifts have consistently redefined how knowledge is categorized and preserved.\n\n${author} demonstrates that clarity of thought leads directly to clarity of action. By dissecting complex mechanisms into digestible components, the narrative builds a bridge between theoretical principles and practical application.\n\nConsider the primary evidence introduced in this chapter. Each argument builds systematically upon the previous one, forming a cohesive perspective that resists easy simplification.`,
  },
  {
    title: 'Chapter 3: Dynamics of Transformation',
    content: `Transformation rarely happens in isolation; it is the product of continuous inquiry and refined methodology. As ${author} observes, the patterns revealed in "${title}" resonate far beyond their original domain.\n\nHere, the text explores how individuals and institutions adapt when confronted with new paradigms. Through detailed case examples and thoughtful synthesis, we observe how foundational ideas take root and evolve.\n\nThe implications of these findings extend into daily practice, encouraging us to maintain intellectual rigor while remaining open to unexpected insights.`,
  },
  {
    title: 'Chapter 4: Synthesis & Lasting Impact',
    content: `In this concluding synthesis of "${title}", ${author} brings together the distinct threads of argument developed throughout the work. What emerges is a enduring testament to the power of structured inquiry in ${category}.\n\nAs readers of Oraculum continue to explore these concepts, the enduring legacy of this work remains clear: true understanding is an ongoing journey of exploration, reflection, and application.\n\nWe return to where we began, enriched with new tools, broader perspectives, and a deeper appreciation for the written word.`,
  },
];

type ThemeMode = 'light' | 'sepia' | 'dark';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

export const StudentReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const bookQuery = useQuery({
    queryKey: ['book-reader', bookId],
    queryFn: () => (bookId ? getBookById(bookId) : Promise.resolve(null)),
    enabled: Boolean(bookId),
  });

  const book = bookQuery.data;

  // Reader state
  const [currentChapter, setCurrentChapter] = useState(0);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Restore saved progress
  useEffect(() => {
    if (bookId) {
      const saved = getBookReadingProgress(bookId);
      if (saved) {
        setCurrentChapter(saved.currentChapter || 0);
      }
    }
  }, [bookId]);

  // Save reading progress on chapter change
  const chapters = getBookChapters(
    book?.title || 'Academic Selection',
    book?.author || 'Oraculum Author',
    book?.category || 'General Studies'
  );

  useEffect(() => {
    if (bookId) {
      const progressPercent = Math.round(((currentChapter + 1) / chapters.length) * 100);
      saveBookReadingProgress({
        bookId,
        currentChapter,
        totalChapters: chapters.length,
        scrollPercentage: progressPercent,
        lastReadAt: new Date().toISOString(),
      });
    }
  }, [bookId, currentChapter, chapters.length]);

  if (bookQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-gray-500">
        Opening digital book reader...
      </div>
    );
  }

  const currentChapterData = chapters[currentChapter] || chapters[0];
  const progressPercent = Math.round(((currentChapter + 1) / chapters.length) * 100);

  // Styling based on theme mode
  const themeStyles = {
    light: 'bg-white text-gray-900 border-gray-200',
    sepia: 'bg-[#fbf0d9] text-[#5f4b32] border-[#e8d7b8]',
    dark: 'bg-[#18181b] text-[#e4e4e7] border-zinc-800',
  }[themeMode];

  const themeContainerBg = {
    light: 'bg-gray-100',
    sepia: 'bg-[#f4e8cf]',
    dark: 'bg-zinc-950',
  }[themeMode];

  const fontSizeClass = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-loose',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  }[fontSize];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${themeContainerBg}`}>
      {/* Reader Control Header */}
      <header className={`sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 sm:px-8 ${themeStyles}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/student/books')}
            className="inline-flex items-center gap-2 rounded-xl border border-current/20 px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </button>

          <div className="hidden md:block border-l border-current/20 pl-3">
            <h1 className="text-sm font-semibold truncate max-w-xs">{book?.title || 'Book Reader'}</h1>
            <p className="text-[11px] opacity-70 truncate">{book?.author}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Table of Contents Toggle */}
          <button
            type="button"
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-current/20 px-2.5 py-1.5 text-xs font-medium"
            title="Table of Contents"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Contents</span>
          </button>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-current/20 p-1 text-xs">
            <Type className="h-3.5 w-3.5 opacity-60 ml-1 mr-1" />
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={clsx('px-1.5 py-0.5 rounded text-xs', fontSize === 'sm' && 'font-bold bg-current/20')}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize('base')}
              className={clsx('px-1.5 py-0.5 rounded text-xs', fontSize === 'base' && 'font-bold bg-current/20')}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('lg')}
              className={clsx('px-1.5 py-0.5 rounded text-xs', fontSize === 'lg' && 'font-bold bg-current/20')}
            >
              A+
            </button>
          </div>

          {/* Theme Modes */}
          <div className="flex items-center gap-1 rounded-lg border border-current/20 p-1">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={clsx('p-1 rounded', themeMode === 'light' && 'bg-gray-200 text-gray-900')}
              title="Light mode"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('sepia')}
              className={clsx('p-1 rounded', themeMode === 'sepia' && 'bg-[#e8d7b8] text-[#5f4b32]')}
              title="Sepia mode"
            >
              <Coffee className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={clsx('p-1 rounded', themeMode === 'dark' && 'bg-zinc-800 text-white')}
              title="Dark mode"
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 dark:bg-zinc-800">
        <div
          className="h-full bg-amber-gold transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Reader Layout Container */}
      <div className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-8">
        {/* Table of contents drawer / overlay */}
        {isTocOpen && (
          <div className={`mb-8 rounded-2xl border p-6 shadow-lg ${themeStyles}`}>
            <div className="flex items-center justify-between border-b border-current/20 pb-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Table of Contents</h3>
              <button
                type="button"
                onClick={() => setIsTocOpen(false)}
                className="text-xs opacity-70 hover:opacity-100"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {chapters.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentChapter(idx);
                    setIsTocOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentChapter === idx
                      ? 'bg-amber-gold text-white'
                      : 'hover:bg-current/10'
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reader Document Surface */}
        <div className={`rounded-2xl border p-6 sm:p-12 shadow-md transition-colors ${themeStyles}`}>
          {/* Chapter Title */}
          <div className="border-b border-current/15 pb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-gold">
              Chapter {currentChapter + 1} of {chapters.length} &bull; {progressPercent}% Completed
            </span>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-normal leading-tight">
              {currentChapterData.title}
            </h2>
          </div>

          {/* Chapter Body Text */}
          <div className={`mt-8 space-y-6 ${fontSizeClass}`}>
            {currentChapterData.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 flex flex-col gap-4 border-t border-current/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setCurrentChapter((prev) => Math.max(0, prev - 1))}
              disabled={currentChapter === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-current/20 px-5 py-2.5 text-xs font-semibold disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Chapter</span>
            </button>

            <span className="text-center text-xs font-medium opacity-70">
              Page {currentChapter + 1} of {chapters.length}
            </span>

            <button
              type="button"
              onClick={() => setCurrentChapter((prev) => Math.min(chapters.length - 1, prev + 1))}
              disabled={currentChapter === chapters.length - 1}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-gold px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-gold-dark disabled:opacity-40"
            >
              <span>Next Chapter</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
