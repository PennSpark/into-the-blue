export type Exhibit = {
    name: string;
    items: Artifact[];
    //description/other info relevant to ui
    totalObjects: number;
    foundObjects: number;
};
  
export type Artifact = {
    id: string;
    name: string;
    description: string;
    imageURL: string;
    svgURL: string;
    exhibit: string;
    //other relevant info/fun facts fro 
    userFound: boolean;
}

export type Region = {
    name: string;
    position: [number, number, number];
    color: string;
    path: string;
  };