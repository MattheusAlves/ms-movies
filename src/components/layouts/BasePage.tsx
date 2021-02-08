interface Props {
  children?: React.ReactNode
}

const BasePage: React.FC = (props: Props) => {
  const { children } = props

  return <div className="base-page">{children}</div>
}

export default BasePage
