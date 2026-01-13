
import React, { useState, useMemo } from 'react';
import { fetchNewsWithGemini } from './services/newsService';
import { NewsArticle, NewsSource } from './types';
import ArticleCard from './components/ArticleCard';

const INITIAL_SOURCES: NewsSource[] = [
  { id: '1', name: '工商時報', domain: 'ctee.com.tw', selected: true },
  { id: '2', name: '經濟日報', domain: 'money.udn.com', selected: true },
  { id: '3', name: 'Digitimes', domain: 'digitimes.com.tw', selected: true },
  { id: '4', name: '科技新報', domain: 'technews.tw', selected: true },
  { id: '10', name: 'SteelNews 鋼鐵網', domain: 'steelnews.com.tw', selected: true },
  { id: '5', name: 'Japan Metal Daily', domain: 'japanmetaldaily.com', selected: false },
  { id: '6', name: 'Newspeed JP', domain: 'newspeed.jp', selected: false },
  { id: '11', name: 'JETRO 日本貿易振興', domain: 'jetro.go.jp', selected: false },
  { id: '7', name: 'BBC News', domain: 'bbc.com', selected: false },
  { id: '8', name: 'Reuters', domain: 'reuters.com', selected: false },
  { id: '9', name: 'Bloomberg', domain: 'bloomberg.com', selected: false },
];

const ARTICLES_PER_PAGE = 6;

// 取得今日日期字串 (YYYY-MM-DD)
const getTodayStr = () => new Date().toISOString().split('T')[0];
// 取得一個月前的日期字串
const getLastMonthStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
};

const HOT_TOPICS: NewsArticle[] = [
  {
    id: 'hot1',
    title: '全球半導體先進封裝產能爭奪戰：CoWoS 需求預期再翻倍',
    summary: '台積電與封測大廠積極擴增先進封裝產能，以應對 AI 伺服器對高性能運算的強烈需求。',
    category: '科技產業',
    sentiment: 'positive',
    source: 'Tech Insights',
    url: 'https://technews.tw/',
    publishedDate: '精選'
  },
  {
    id: 'hot2',
    title: '不鏽鋼市場展望：亞洲鋼價走勢分析',
    summary: '市場密切關注中國鋼廠出口動向，亞洲區域不鏽鋼盤價呈現築底反彈跡象。',
    category: '鋼鐵市場',
    sentiment: 'neutral',
    source: 'Steel Watch',
    url: 'http://www.steelnews.com.tw/',
    publishedDate: '精選'
  }
];

const App: React.FC = () => {
  const [keywords, setKeywords] = useState('');
  const [startDate, setStartDate] = useState(getLastMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<NewsSource[]>(INITIAL_SOURCES);
  const [showAccountInfo, setShowAccountInfo] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSource = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const sourceGroups = [
    { title: '🇹🇼 台灣財經與產業', items: sources.filter(s => ['1', '2', '3', '4', '10'].includes(s.id)) },
    { title: '🇯🇵 日本產業與機構', items: sources.filter(s => ['5', '6', '11'].includes(s.id)) },
    { title: '🌐 全球國際媒體', items: sources.filter(s => ['7', '8', '9'].includes(s.id)) }
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keywords.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1);
    setError(null);
    
    const dateRangeStr = `${startDate} to ${endDate}`;
    
    try {
      const { articles: fetchedArticles, rawAnalysis } = await fetchNewsWithGemini(keywords, sources, dateRangeStr);
      setArticles(fetchedArticles);
      setTrendAnalysis(rawAnalysis);
    } catch (err) {
      setError('抓取新聞時發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const displayedArticles = useMemo(() => {
    const list = hasSearched ? articles : HOT_TOPICS;
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    return list.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
  }, [articles, hasSearched, currentPage]);

  const totalPages = Math.ceil((hasSearched ? articles.length : HOT_TOPICS.length) / ARTICLES_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const resultsElement = document.getElementById('results-section');
    if (resultsElement) resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className={`fixed top-6 right-6 z-50 transition-all duration-300 ${showAccountInfo ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-4 w-72">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">🔑 帳號密碼資訊</h3>
            <button onClick={() => setShowAccountInfo(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="space-y-3 text-[10px]">
             <div><p className="font-bold text-blue-600">&lt;SNN&gt;</p><p className="text-slate-600">cindy.tsai@sumitomocorp.com / kaozz1234</p></div>
             <div><p className="font-bold text-blue-600">&lt;日刊鐵鋼&gt;</p><p className="text-slate-600">japanmetaldaily@sumitomocorp.com / NCznH6Lr</p></div>
             <div><p className="font-bold text-blue-600">&lt;日刊產業&gt;</p><p className="text-slate-600">sumitomocorp / ZaFbKXwｍ</p></div>
          </div>
        </div>
      </div>

      {!showAccountInfo && (
        <button onClick={() => setShowAccountInfo(true)} className="fixed top-6 right-6 z-50 bg-white border border-slate-200 p-3 rounded-full shadow-lg text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
        </button>
      )}

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
          News <span className="text-blue-600">Intelligence</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">專業新聞智能抓取系統：依日期區間深度檢索產業動態。</p>
      </header>

      <div className="max-w-3xl mx-auto mb-16 space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative flex items-center">
            {/* 修改輸入框樣式：背景設為白色，文字設為深灰色以確保清晰 */}
            <input
              type="text"
              className="w-full pl-5 pr-32 py-4 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-lg placeholder:text-slate-400"
              placeholder="搜尋關鍵字：如「華新盤價」、「鋼鐵減產」..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '抓取中...' : '即時抓取'}
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">查詢區間:</span>
            <div className="flex items-center gap-2 w-full">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-400 outline-none w-full"
              />
              <span className="text-slate-400">至</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-400 outline-none w-full"
              />
            </div>
          </div>
        </form>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
          <div className="mb-4 text-sm font-black text-slate-400 uppercase tracking-widest">媒體來源配置</div>
          <div className="space-y-6">
            {sourceGroups.map((group, idx) => (
              <div key={idx} className={idx !== 0 ? 'pt-4 border-t border-slate-50' : ''}>
                <h4 className="text-xs font-bold text-slate-500 mb-3">{group.title}</h4>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(source => (
                    <button
                      key={source.id}
                      onClick={() => toggleSource(source.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        source.selected ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      {source.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {trendAnalysis && !loading && (
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm mb-12">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">📊 深度洞察摘要</h2>
          <div className="text-slate-700 leading-relaxed font-medium border-l-4 border-blue-400 pl-5">{trendAnalysis}</div>
        </div>
      )}

      <div id="results-section" className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          {hasSearched ? `搜尋結果 (${articles.length})` : '近期產業熱門話題'}
        </h2>
        {hasSearched && !loading && totalPages > 1 && (
          <span className="text-xs font-bold text-slate-400">第 {currentPage} / {totalPages} 頁</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl h-72 border border-slate-100 shadow-sm"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pb-12">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 border rounded-lg disabled:opacity-30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`min-w-[40px] h-10 rounded-lg text-sm font-bold ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border rounded-lg disabled:opacity-30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
