import fs from 'fs';

let blogDataFile = fs.readFileSync('C:/Users/kkarm/OneDrive/Desktop/FourIQ Tech/src/data/blogPosts.ts', 'utf8');

let newPost = `
  {
    slug: 'test-slug',
    title: 'Test',
  },`;

let updated = blogDataFile.replace(
  'export const blogPosts: BlogPost[] = [',
  `export const blogPosts: BlogPost[] = [${newPost}`
);

if (updated === blogDataFile) {
  console.log("REPLACE FAILED");
} else {
  console.log("REPLACE SUCCEEDED");
}
