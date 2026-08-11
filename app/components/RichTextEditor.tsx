import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eye,
  FileCode,
  Sparkles,
  Cloud,
  Check,
  Undo,
  Redo,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { R2ImageUploader } from './R2ImageUploader.js';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tuliskan artikel berita selengkapnya di sini...'
}) => {
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'code' | 'preview'>('wysiwyg');
  const [showR2Modal, setShowR2Modal] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Sync value from props to innerHTML
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, editorMode]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  const execCmd = (command: string, value: string = '') => {
    if (editorMode !== 'wysiwyg') return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleInsertHeading = (tag: string) => {
    execCmd('formatBlock', tag);
  };

  const handleInsertLink = () => {
    const url = prompt('Masukkan URL Link target:', 'https://');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const handleInsertR2Image = () => {
    if (!inlineImageUrl) return;
    
    let alignClass = 'mx-auto block text-center';
    if (imageAlign === 'left') alignClass = 'float-left mr-4 mb-2 max-w-sm';
    if (imageAlign === 'right') alignClass = 'float-right ml-4 mb-2 max-w-sm';

    const captionHtml = imageCaption ? `<figcaption class="text-center text-xs text-slate-500 mt-1 italic">${imageCaption}</figcaption>` : '';
    const imgHtml = `<figure class="my-4 ${alignClass}"><img src="${inlineImageUrl}" alt="${imageCaption || 'Gambar Berita'}" class="rounded-2xl max-w-full h-auto shadow-md border border-slate-200 dark:border-slate-800" />${captionHtml}</figure><p><br></p>`;

    if (editorMode === 'wysiwyg' && editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();
    } else {
      onChange(value + imgHtml);
    }

    setShowR2Modal(false);
    setInlineImageUrl('');
    setImageCaption('');
  };

  // Stats calculation
  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');
  const plainText = stripHtml(value);
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50 bg-white dark:bg-[#0f1115] shadow-2xl flex flex-col'
          : 'bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800'
      }`}
    >
      {/* Top Main Toolbar */}
      <div className="p-3 border-b bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* Formatting Actions */}
        <div className="flex items-center gap-1 flex-wrap">
          <div className="flex items-center gap-0.5 bg-white dark:bg-[#0f1115] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => execCmd('undo')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Urungkan (Undo)"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('redo')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Ulangi (Redo)"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-800 mx-1" />

          {/* Text Style Dropdown */}
          <select
            onChange={(e) => handleInsertHeading(e.target.value)}
            defaultValue="p"
            className="px-2.5 py-1 text-xs rounded-xl border bg-white dark:bg-[#0f1115] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-semibold"
          >
            <option value="p">Paragraf Normal</option>
            <option value="h2">Heading 2 (Sub-judul)</option>
            <option value="h3">Heading 3 (Judul Bagian)</option>
            <option value="h4">Heading 4 (Kecil)</option>
            <option value="blockquote">Kutipan Blockquote</option>
            <option value="pre">Blok Kode (Code Block)</option>
          </select>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-800 mx-1" />

          {/* Formatting Buttons */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-[#0f1115] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => execCmd('bold')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              title="Tebal (Bold)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 italic"
              title="Miring (Italic)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 underline"
              title="Garis Bawah (Underline)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('strikeThrough')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 line-through"
              title="Coretan (Strikethrough)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-800 mx-1" />

          {/* Alignments */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-[#0f1115] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => execCmd('justifyLeft')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Rata Kiri"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyCenter')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Rata Tengah"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyRight')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Rata Kanan"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyFull')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Rata Kanan Kiri (Justify)"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-800 mx-1" />

          {/* Lists & Extras */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-[#0f1115] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleInsertLink}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Sisipkan Tautan/Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertHorizontalRule')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Garis Pemisah (HR)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-800 mx-1" />

          {/* R2 Cloudfare Upload Button */}
          <button
            type="button"
            onClick={() => setShowR2Modal(true)}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Sisipkan Gambar dari R2 Cloudflare"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>+ Media R2</span>
          </button>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#0f1115] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setEditorMode('wysiwyg')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              editorMode === 'wysiwyg'
                ? 'bg-emerald-500 text-black shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('code')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              editorMode === 'code'
                ? 'bg-emerald-500 text-black shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCode className="w-3 h-3" />
            <span>HTML Code</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('preview')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              editorMode === 'preview'
                ? 'bg-emerald-500 text-black shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white ml-1"
            title="Toggle Fullscreen Editor"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className={`p-4 relative ${isFullscreen ? 'flex-1 overflow-y-auto' : 'min-h-[350px]'}`}>
        {editorMode === 'wysiwyg' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] text-sm text-slate-900 dark:text-slate-200 leading-relaxed font-sans"
            style={{ minHeight: '300px' }}
          />
        )}

        {editorMode === 'code' && (
          <textarea
            rows={15}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full min-h-[300px] p-4 font-mono text-xs rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none leading-relaxed"
            placeholder="<html><body>Tuliskan kode HTML berita di sini...</body></html>"
          />
        )}

        {editorMode === 'preview' && (
          <div className="prose dark:prose-invert max-w-none min-h-[300px] p-4 bg-slate-50/50 dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800/80">
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: value }} />
            ) : (
              <p className="text-slate-400 italic text-center py-8">Belum ada konten artikel untuk ditampilkan.</p>
            )}
          </div>
        )}
      </div>

      {/* Editor Footer Status Bar */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-[#16181d] border-t border-slate-200 dark:border-slate-800 rounded-b-2xl flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span>Kata: <strong className="text-slate-800 dark:text-slate-200">{wordCount}</strong></span>
          <span>Karakter: <strong className="text-slate-800 dark:text-slate-200">{charCount}</strong></span>
          <span>Estimasi Baca: <strong className="text-slate-800 dark:text-slate-200">~{readingTime} Menit</strong></span>
        </div>

        <div className="flex items-center gap-1.5 text-orange-500 font-bold">
          <Cloud className="w-3 h-3" />
          <span>Professional Open Source Editor (R2 Media Engine)</span>
        </div>
      </div>

      {/* Modal R2 Media Inserter */}
      {showR2Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-orange-500" />
                <span>Sisipkan Media Gambar dari Cloudflare R2</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowR2Modal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <R2ImageUploader
              value={inlineImageUrl}
              onChange={(url) => setInlineImageUrl(url)}
              label="Unggah atau Masukkan URL Media R2"
              placeholder="https://pub-r2.dev/uploads/gambar_artikel.jpg"
              aspectRatio="aspect-16/9"
              compact
            />

            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                Keterangan Gambar (Caption & Alt Text)
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Contoh: Suasana konferensi pers redaksi di Jakarta"
                className="w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                Posisi Alignment Gambar
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'center', label: 'Tengah (Full)' },
                  { key: 'left', label: 'Kiri (Wrap)' },
                  { key: 'right', label: 'Kanan (Wrap)' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setImageAlign(item.key as any)}
                    className={`py-1.5 rounded-xl border text-xs font-bold ${
                      imageAlign === item.key
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : 'bg-slate-50 dark:bg-[#16181d] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowR2Modal(false)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInsertR2Image}
                disabled={!inlineImageUrl}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-400 text-white disabled:opacity-40 flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Sisipkan ke Body Artikel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
