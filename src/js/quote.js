const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

const fetchDailyQuote = async () => {
  const savedText = localStorage.getItem('quote-text');
  const savedAuthor = localStorage.getItem('quote-author');
  const savedDay = localStorage.getItem('quote-date');
  
  const today = getCurrentDate();

  if (savedDay === today && savedText && savedAuthor) {
    return { quote: savedText, author: savedAuthor };
  }

  try {
    const apiResponse = await fetch('https://your-energy.b.goit.study/api/quote');
    const result = await apiResponse.json();

    const { quote, author } = result;

    localStorage.setItem('quote-text', quote);
    localStorage.setItem('quote-author', author);
    localStorage.setItem('quote-date', today);

    return { quote, author };
  } catch (err) {
    return savedText && savedAuthor ? { quote: savedText, author: savedAuthor } : null;
  }
};

export const displayQuote = async () => {
  const content = await fetchDailyQuote();

  if (!content) return;

  const textView = document.getElementById('js-exercises-quote-text');
  const authorView = document.getElementById('js-exercises-quote-author');

  if (textView) {
    textView.textContent = content.quote;
  }

  if (authorView) {
    authorView.textContent = content.author;
  }
};