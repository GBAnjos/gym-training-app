import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import { parseTrainingText, parseDietText } from '../utils/importParser';
import * as pdfjsLib from 'pdfjs-dist';
import './ImportPage.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const MAX_TEXT_LENGTH = 50000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (PDFs can be larger)
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv', '.pdf'];

export function ImportPage({ type = 'training', onBack, onComplete }) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [inputMethod, setInputMethod] = useState('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [parsing, setParsing] = useState(false);

  const isTraining = type === 'training';
  const title = isTraining ? t('import_title_training') : t('import_title_diet');

  const handleTextChange = useCallback((value) => {
    if (value.length > MAX_TEXT_LENGTH) {
      setError(t('import_error_too_large'));
      return;
    }
    setError('');
    setText(value);
    setParsed(null);
  }, [t]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(t('import_error_format'));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(t('import_error_file_too_large'));
      return;
    }

    setError('');
    setFileName(file.name);
    setParsed(null);

    if (ext === '.pdf') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const typedArray = new Uint8Array(ev.target.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          const pages = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();

            // Group text items by Y position so we reconstruct real lines.
            // PDF Y is bottom-up, transform[5] is the Y coordinate.
            const buckets = new Map();
            for (const item of content.items) {
              if (!item.str.trim()) continue;
              const y = Math.round(item.transform[5] / 3) * 3; // 3px tolerance bucket
              if (!buckets.has(y)) buckets.set(y, []);
              buckets.get(y).push(item.str);
            }
            // Sort descending Y (top of page first), join tokens per line with space
            const pageLines = [...buckets.entries()]
              .sort((a, b) => b[0] - a[0])
              .map(([, tokens]) => tokens.join(' ').trim())
              .filter(Boolean);
            pages.push(pageLines.join('\n'));
          }
          const extracted = pages.join('\n');
          if (!extracted.trim()) {
            setError(language === 'pt-BR' ? 'PDF sem texto extraível (pode ser uma imagem)' : 'PDF has no extractable text (may be image-based)');
            return;
          }
          setText(extracted);
        } catch {
          setError(language === 'pt-BR' ? 'Erro ao ler o PDF' : 'Failed to read PDF');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setText(ev.target.result);
      };
      reader.readAsText(file);
    }
  }, [t, language]);

  const handleParse = useCallback(() => {
    if (!text.trim()) return;
    setParsing(true);
    setError('');

    // Use setTimeout to allow UI to show loading state
    setTimeout(() => {
      const result = isTraining ? parseTrainingText(text) : parseDietText(text);

      if (result.errors?.includes('no_data')) {
        setError(t('import_error_no_data'));
        setParsed(null);
      } else {
        setParsed(result);
      }
      setParsing(false);
    }, 100);
  }, [text, isTraining, t]);

  const handleActivate = useCallback(() => {
    if (!parsed) return;

    if (isTraining) {
      // Convert parsed days to vida_workout_plan format
      const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const trainingDays = parsed.days.slice(0, 7).map((_, i) => WEEKDAYS[i]);
      const dayActivities = {};

      parsed.days.forEach((day, i) => {
        if (i >= 7) return;
        const weekday = WEEKDAYS[i];
        dayActivities[weekday] = {
          type: 'gym',
          session: {
            label: String(i + 1),
            name: day.name,
            focus: 'imported',
            icon: 'upload-1',
          },
          exercises: day.exercises.map(ex => ({
            id: ex.matched?.id || ex.name.toLowerCase().replace(/\s+/g, '_'),
            nome: ex.matched?.name || ex.name,
            series: ex.sets || 3,
            reps: ex.reps || '12',
            musculos: ex.matched?.bodyPart ? [ex.matched.bodyPart] : [],
            restSeconds: ex.rest || 60,
          })),
        };
      });

      const plan = {
        name: language === 'pt-BR' ? 'Treino Importado' : 'Imported Training',
        splitType: 'imported',
        trainingDays,
        dayActivities,
        goals: ['imported'],
        generatedAt: new Date().toISOString(),
      };

      localStorage.setItem('vida_workout_plan', JSON.stringify(plan));
      toast.success(language === 'pt-BR' ? 'Treino importado!' : 'Training imported!');
    } else {
      // Convert parsed meals to vida_custom_diet format
      const diet = {
        name: language === 'pt-BR' ? 'Dieta Importada' : 'Imported Diet',
        meals: parsed.meals.map(m => ({
          id: m.id,
          name: m.name,
          time: '',
          foods: m.foods.map(f => ({
            id: f.id,
            name: f.name,
            quantity: f.quantity || '',
            calories: f.calories || '',
            protein: f.protein || '',
            carbs: f.carbs || '',
            fat: f.fat || '',
          })),
        })),
        dailyTargets: parsed.dailyTargets || { calories: null, protein: null, carbs: null, fat: null },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('vida_custom_diet', JSON.stringify(diet));
      toast.success(language === 'pt-BR' ? 'Dieta importada!' : 'Diet imported!');
    }

    onComplete?.();
  }, [parsed, isTraining, language, toast, onComplete]);

  return (
    <div className="import-page">
      <div className="import-header">
        <button className="import-back" onClick={onBack}>
          <Icon name="chevron-left" />
        </button>
        <h1 className="import-title">{title}</h1>
      </div>

      {/* Input Method Tabs */}
      <div className="import-tabs">
        <button
          className={`import-tab ${inputMethod === 'paste' ? 'active' : ''}`}
          onClick={() => { setInputMethod('paste'); setError(''); setParsed(null); }}
        >
          <Icon name="clipboard-1" />
          <span>{t('import_tab_paste')}</span>
        </button>
        <button
          className={`import-tab ${inputMethod === 'upload' ? 'active' : ''}`}
          onClick={() => { setInputMethod('upload'); setError(''); setParsed(null); }}
        >
          <Icon name="upload-1" />
          <span>{t('import_tab_upload')}</span>
        </button>
      </div>

      {/* Input Area */}
      {!parsed && (
        <div className="import-input-area">
          {inputMethod === 'paste' ? (
            <textarea
              className="import-textarea"
              placeholder={isTraining ? t('import_paste_placeholder') : t('import_paste_placeholder_diet')}
              value={text}
              onChange={e => handleTextChange(e.target.value)}
              rows={12}
            />
          ) : (
            <div className="import-upload-zone" onClick={() => fileInputRef.current?.click()}>
              <Icon name="upload-1" className="import-upload-icon" />
              <p className="import-upload-label">{fileName || t('import_upload_btn')}</p>
              <p className="import-upload-hint">{t('import_upload_hint')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {error && <p className="import-error">{error}</p>}

          <button
            className="import-parse-btn"
            onClick={handleParse}
            disabled={!text.trim() || parsing}
          >
            {parsing ? t('import_parsing') : t('import_parse_btn')}
          </button>
        </div>
      )}

      {/* Preview */}
      {parsed && (
        <div className="import-preview">
          <h3 className="import-preview-title">{t('import_preview_title')}</h3>

          {isTraining ? (
            <TrainingPreview days={parsed.days} t={t} language={language} />
          ) : (
            <DietPreview meals={parsed.meals} dailyTargets={parsed.dailyTargets} t={t} language={language} />
          )}

          <div className="import-actions">
            <button className="import-back-btn" onClick={() => setParsed(null)}>
              <Icon name="chevron-left" />
              <span>{language === 'pt-BR' ? 'Voltar' : 'Back'}</span>
            </button>
            <button className="import-activate-btn" onClick={handleActivate}>
              {t('import_activate_btn')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TrainingPreview({ days, t, language }) {
  return (
    <div className="import-preview-list">
      {days.map((day, i) => (
        <div key={i} className="import-preview-day">
          <h4 className="import-preview-day-name">{day.name}</h4>
          <div className="import-preview-exercises">
            {day.exercises.map((ex, j) => (
              <div key={j} className={`import-preview-item confidence-${ex.confidence}`}>
                <div className="import-preview-item-main">
                  <span className="import-preview-item-name">
                    {ex.matched?.name || ex.name}
                  </span>
                  <span className="import-preview-item-detail">
                    {ex.sets} × {ex.reps}
                  </span>
                </div>
                {ex.confidence === 'low' && (
                  <span className="import-confidence-label low">{t('import_confidence_low')}</span>
                )}
                {ex.confidence === 'medium' && (
                  <span className="import-confidence-label medium">{t('import_confidence_medium')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DietPreview({ meals, dailyTargets, t, language }) {
  return (
    <div className="import-preview-list">
      {dailyTargets?.calories && (
        <div className="import-preview-targets">
          <span>{language === 'pt-BR' ? 'Meta diária' : 'Daily target'}: {dailyTargets.calories} cal</span>
          {dailyTargets.protein && <span> · {dailyTargets.protein}g P</span>}
          {dailyTargets.carbs && <span> · {dailyTargets.carbs}g C</span>}
          {dailyTargets.fat && <span> · {dailyTargets.fat}g {language === 'pt-BR' ? 'G' : 'F'}</span>}
        </div>
      )}
      {meals.map((meal, i) => (
        <div key={i} className="import-preview-day">
          <h4 className="import-preview-day-name">{meal.name}</h4>
          <div className="import-preview-exercises">
            {meal.foods.map((food, j) => (
              <div key={j} className={`import-preview-item confidence-${food.confidence}`}>
                <div className="import-preview-item-main">
                  <span className="import-preview-item-name">{food.name}</span>
                  <span className="import-preview-item-detail">
                    {food.quantity && `${food.quantity}`}
                    {food.calories && ` · ${food.calories} cal`}
                  </span>
                </div>
                {food.confidence === 'low' && (
                  <span className="import-confidence-label low">{t('import_confidence_low')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
