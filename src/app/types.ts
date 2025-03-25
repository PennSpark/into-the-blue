export type Exhibit = {
	name: string;
	items: Artifact[];
	description: string;
	//description/other info relevant to ui
	totalObjects: number;
	foundObjects: number;
};

export type Artifact = {
	id: string;
	name: string;
	time: string;
	material: string;
	exhibit: string;
	exhibitID: string;
	imageURL: string;
	svgURL: string;
	//other relevant info/fun facts fro
	hint: string;
};

export type Region = {
	name: string;
	position: [number, number, number];
	color: string;
	path: string;
};
