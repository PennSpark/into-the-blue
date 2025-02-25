export type Artifact = {
    id: string;
    name: string;
    description: string;
    imageURL: string;
    svgURL: string;
    exhibit: string;
}

export type Exhibit = {
    id: string;
};
  
export type ExhibitData = {
    name: string;
    items: { id: string; title: string }[];
};
  