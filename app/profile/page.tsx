import ProfileRoute from '@/components/ProfileRoute';
import {SOCIAL_IMAGE} from '@/lib/seo';
const title='Digital Profile';
const description='Open an EdgeTap profile to view the contact details and links its owner has chosen to share.';
export const metadata = {title,description,robots:{index:false,follow:false},openGraph:{type:'website',siteName:'EdgeTap',title,description,images:[SOCIAL_IMAGE]},twitter:{card:'summary_large_image',title,description,images:[SOCIAL_IMAGE.url]}};
export default function ProfileShell(){return <ProfileRoute/>;}
