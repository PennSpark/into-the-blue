import { redirect } from 'next/navigation';

export default function Page() {
	fetch("https://script.google.com/macros/s/AKfycbxClD0SugJ2YnZjP6pRsYj0COqrsVQwClY_1Wao9LbYzEUELTCC1Gq4yY7jEd1I-RM4fg/exec?source=qr-desk")
		.then(response => response.text())
		.then(data => console.log(data));
	redirect('/welcome');
	// Optionally: return null; // unreachable code but required by some setups
}