import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { BOOKS, STRINGS } from '@biblia/core';
import { DataError, getChapter, listTranslations, searchVerses } from './data';

export function createApp(): express.Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, books: BOOKS.length });
  });

  app.get('/api/translations', (_req, res) => {
    res.json({ translations: listTranslations() });
  });

  app.get('/api/books', (_req, res) => {
    res.json({
      books: BOOKS.map((b) => ({
        id: b.id,
        testament: b.testament,
        chapters: b.chapters,
        names: b.names,
        abbr: b.abbr,
      })),
    });
  });

  app.get('/api/chapter', async (req, res, next) => {
    try {
      const translation = String(req.query.translation ?? 'almeida');
      const book = String(req.query.book ?? '');
      const chapter = Number(req.query.chapter ?? NaN);
      if (!book) throw new DataError(400, 'missing_book', 'parâmetro book é obrigatório');
      if (!Number.isFinite(chapter)) {
        throw new DataError(400, 'missing_chapter', 'parâmetro chapter é obrigatório');
      }
      res.json(await getChapter(translation, book, chapter));
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/search', (req, res, next) => {
    try {
      const q = String(req.query.q ?? '').trim();
      if (q.length < 2) {
        res.json({ hits: [], truncated: false });
        return;
      }
      const limit = Math.min(Math.max(Number(req.query.limit ?? 40) || 40, 1), 100);
      res.json(searchVerses(q, limit));
    } catch (err) {
      next(err);
    }
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof DataError) {
      res.status(err.status).json({ error: err.code, message: err.message });
      return;
    }
    res.status(500).json({ error: 'internal', message: (err as Error).message });
  });

  return app;
}
