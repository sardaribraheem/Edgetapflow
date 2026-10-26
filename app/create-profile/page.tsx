import type {Metadata} from 'next';
import FreeProfileBuilder from '@/components/FreeProfileBuilder';
export const metadata:Metadata={title:'Create your free EdgeTap profile',robots:{index:false,follow:false}};
export default function CreateProfilePage(){return <FreeProfileBuilder/>;}
