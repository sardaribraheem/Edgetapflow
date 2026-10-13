import Icon from "./Icon";

export default function DefaultAvatar({ size = 56 }: { size?: number }) {
  return <span role="img" aria-label="Default profile picture" className="default-avatar"><Icon name="avatar" size={size} /></span>;
}
