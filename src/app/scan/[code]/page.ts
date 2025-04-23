import { redirect } from 'next/navigation';

// This page handles all scanning code types
export default function ScanPage({ params }: { params: { code: string } }) {
  // Get the code from URL parameters
  const { code } = params;
  
  // Make the API call with the dynamic code parameter
  const apiUrl = `https://script.google.com/macros/s/AKfycbxClD0SugJ2YnZjP6pRsYj0COqrsVQwClY_1Wao9LbYzEUELTCC1Gq4yY7jEd1I-RM4fg/exec?source=${code}`;
  
  fetch(apiUrl)
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error logging scan:', error));
  
  // Redirect to welcome page
  redirect('/welcome');
}

// Pre-generate routes for specific codes at build time
export function generateStaticParams() {
  // List all known codes here
  return [
    { code: 'into-the-blue' },
    { code: 'etruscan' },
    { code: 'greece' },
    { code: 'rome' },
    { code: 'eastern-mediterranean' },
    { code: 'asia' },
    { code: 'egypt' },
    { code: 'middle-east' },
    { code: 'north-america' },
    { code: 'mexico-central-america' },
    { code: 'africa' },
    { code: 'assyria' },
    { code: 'front-desk' },
    { code: 'cartifacts' },
    { code: 'summer' },
    { code: 'spark' },
    { code: 'other'}
  ].map(code => ({ code: code.code }));
}