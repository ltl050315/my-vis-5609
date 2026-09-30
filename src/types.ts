export type TMovie = {
  tconst: string;
  title_type: string;
  primary_title: string;
  original_title: string;
  simple_title: string;
  year: Date | null;
  runtime_minutes: number | null;
  genres: string[];
  average_rating: number | null;
  num_votes: number;
};
