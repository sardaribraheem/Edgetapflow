import {CatalogPrice,CatalogRenewal,CatalogExtras} from '@/components/CatalogPrice';
import type {ReactNode} from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SUPPORT_EMAIL, SUPPORT_URL } from "@/lib/site";
import ProfileCardOffer from '@/components/ProfileCardOffer';
import ProfileOffer from '@/components/ProfileOffer';
import ProductPriceDetails from '@/components/ProductPriceDetails';
import ProfileMediaOffer from '@/components/ProfileMediaOffer';
import PricingDetails from '@/components/PricingDetails';
import PricingCarousel from "@/components/PricingCarousel";
import Icon from '@/components/ui/Icon';
import { publicPageMetadata } from '@/lib/seo';
export const metadata=publicPageMetadata('/pricing','NFC Card & Digital Profile Pricing','Compare Link Cards, editable EdgeTap Profile Cards and a custom website with four linked cards. View detailed NFC tag, printed/unprinted card, programming and profile prices.');
function Features({items}:{items:ReactNode[]}){return <ul className="pricing-features">{items.map((item,index)=><li key={index}><Icon name="check" size={16}/><span>{item}</span></li>)}</ul>;}
export default function PricingPage(){return <><Navbar/><main id="main-content" tabIndex={-1} className="pricing-page">
<header className="pricing-heading"><h1 className="font-display">Choose your card.</h1><p className="pricing-intro">One link, your profile, or a website of your own.</p></header>
<PricingCarousel>
  <section aria-labelledby="link-plan" className="pricing-option">
    <Icon name="link" size={28}/><h2 id="link-plan" className="font-display">Link Card</h2><CatalogPrice product="direct_link"/>
    <p className="pricing-price-detail">one customizable card</p><p className="pricing-description">Tap to open your website, WhatsApp or portfolio.</p>
    <Features items={['Your design on both sides','One link + optional QR','Delivery included where confirmed']}/>
    <div className="pricing-option-action"><Link href="/order?product=direct_link" className="btn btn-ink">Get your Link Card <span aria-hidden="true">→</span></Link></div>
  </section>
  <ProfileCardOffer><section aria-labelledby="standard-plan" className="pricing-option pricing-option-featured">
    <div className="pricing-featured-top"><Icon name="user" size={28}/><span className="popular-label">Popular</span></div>
    <h2 id="standard-plan" className="font-display">EdgeTap Profile Card</h2><CatalogPrice product="profile"/>
    <p className="pricing-price-detail">card + profile setup help</p><p className="pricing-description">All your links in one profile, ready to share with a tap.</p>
    <Features items={['Customizable NFC card + optional QR','Editable profile + Save Contact','Delivery included where confirmed']}/>
    <Link href="/u/ibraheem" className="mt-4 inline-block text-sm font-semibold underline">See an example profile ↗</Link>
    <div className="pricing-option-action"><Link href="/order?product=profile" className="btn btn-yellow">Get your EdgeTap card <span aria-hidden="true">→</span></Link></div>
  </section></ProfileCardOffer>
  <section aria-labelledby="website-plan" className="pricing-option pricing-option-website">
    <Icon name="card" size={28}/><h2 id="website-plan" className="font-display">Your Website + Cards</h2><CatalogPrice product="website"/>
    <p className="pricing-price-detail">website + four cards</p><p className="pricing-description">A website built around your work, with cards that lead there.</p>
    <Features items={['Custom website or portfolio','Four NFC cards within the first year','First-year domain + hosting; renewal quoted']}/>
    <div className="pricing-option-action"><a href="#contact" className="btn btn-ink">Discuss my website <span aria-hidden="true">→</span></a></div>
  </section>
</PricingCarousel>
<ProfileOffer/>
<PricingDetails><ProductPriceDetails/><CatalogExtras/><p className="pricing-details-renewal"><CatalogRenewal/></p><ProfileMediaOffer/></PricingDetails>
<section id="contact" tabIndex={-1} className="pricing-contact"><h2 className="font-display">Need something else?</h2><p>Ask about business cards, bulk orders or a custom NFC idea.</p><div className="pricing-contact-links"><a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ink">Chat on WhatsApp</a><a href={'mailto:'+SUPPORT_EMAIL} className="pricing-email">{SUPPORT_EMAIL}</a></div></section>
<details className="pricing-order-details"><summary className="font-display">Before you order a card</summary><p>Cards are PVC with NFC; tags are separate small NFC chips/stickers. Wood is a printed design. The customizable offers include front/back design choices or your uploaded artwork. Standard printed cards use the EdgeTap design; unprinted cards have no printed artwork or QR. Staff reviews the final artwork before printing.</p><p>The customizable Link Card and Profile Card offers include delivery where coverage is confirmed. Detailed hardware prices are for pickup; delivery needs an agreed quote. Confirm coverage and the full total before paying. Or collect at NASTP Delta 3, Monday–Friday, 9 am–5 pm (Pakistan time); contact +92 304 414 9674 when you arrive.</p><p>For printed cards, you can arrange a design review with EdgeTap. If a front/back proof is shared in My orders, check both sides before approving it. A digital profile or NFC tag does not require a printed-card proof. Printed-card orders include one revision request with all changes in one note; further edits are quoted separately. <Link href="/terms" className="underline">Read the personalized-card terms</Link>.</p><p>Need a tag or unprinted card? Choose from the detailed price chart above; agree delivery coverage before payment. Cards in one order share the same design and destination. Link Card opens your existing URL; Profile duration and renewal follow the offer shown before publication or purchase; existing customer terms stay unchanged. The website renewal figure is an estimate; the chosen domain, hosting and final renewal price are agreed directly before starting. Existing agreed renewal prices remain unchanged.</p></details></main><Footer/></>;}
