import PhoneProfile from './PhoneProfile';
import Icon from './ui/Icon';

export default function ConnectedProfiles() {
  return <figure className="connected-profiles" aria-label="Ibraheem Anwar and Umar Khan on two connected phones">
    <div className="connected-phones">
      <div className="story-device is-connected connection-phone-left"><PhoneProfile/></div>
      <div className="story-device is-connected connection-phone-right"><PhoneProfile person={{displayName:'Umar Khan',title:'Entrepreneur',location:'Lahore',avatar:'/umar-story.webp'}}/></div>
    </div>
    <figcaption><Icon name="link" size={17}/> Connection established</figcaption>
  </figure>;
}
