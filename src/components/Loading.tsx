import ReactLoading from 'react-loading'

const Loading = (): JSX.Element => {
  return (
    <div className="loading-wrapper">
      <ReactLoading
        type="spinningBubbles"
        color="#4B45FF"
        className="loading"
        height={167}
        width={250}
      />
    </div>
  )
}

export default Loading
