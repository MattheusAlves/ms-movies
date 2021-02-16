import ReactLoading from 'react-loading'
interface Props {
  width?: string
}
const Loading = (props: Props): JSX.Element => {
  return (
    <div className="loading-wrapper">
      <ReactLoading
        type="spinningBubbles"
        color="#4B45FF"
        className="loading"
        width={props.width || '20vw'}
      />
    </div>
  )
}

export default Loading
