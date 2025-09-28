export interface NewsItem {
  symbol: string;
  newsTitle: string;
  newsURL: string;
  publishedDate: string;
  gradingCompany?: string;
  analystCompany?: string;
  newsPublisher: string;
  newGrade?: string;
  previousGrade?: string;
  priceTarget?: number;
  analystName?: string;
};