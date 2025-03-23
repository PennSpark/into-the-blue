import { Artifact } from '../../../../types';
import Image from 'next/image';
import Link from 'next/link';

export default function CapturedInterface( { image, artifact }: { image: string | null, artifact: Artifact }) {
    return (
        <div className='w-[100svw] h-[100svh] bg-blue-200 flex flex-col gap-5 justify-center items-center'>
            <p>{artifact.name}</p>
            {image && <Image src={image} alt="Captured" className="w-[40svh] h-auto" width={500} height={500} />}
            {/* this routing not ideal when other exhibits arent one word but oh well i'll revisit*/}
            <Link href={`/exhibit/${artifact.exhibit.toLowerCase()}`}>djskhfkdjshfkdjshfsd</Link>
        </div>
    )
    }
