-- 特許ステータス列と検索ブックマーク
ALTER TABLE source_documents ADD COLUMN IF NOT EXISTS patent_status varchar(100);
ALTER TABLE search_queries ADD COLUMN IF NOT EXISTS is_bookmarked boolean NOT NULL DEFAULT false;
