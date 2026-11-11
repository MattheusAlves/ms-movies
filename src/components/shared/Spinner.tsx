interface Props {
  size?: string
}

export default function Spinner({ size = '2rem' }: Props): React.JSX.Element {
  return (
    <span
      className="spinner"
      role="status"
      aria-label="Carregando"
      style={{ width: size, height: size }}
    />
  )
}
