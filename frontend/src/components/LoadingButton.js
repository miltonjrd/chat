const LoadingButton = ({ disable, title, active }) => {
  return (
    <button className="btn btn-primary rounded-0 shadow-sm position-relative" type="submit" disable={disable}>
      <span 
        className={`position-absolute spinner-border spinner-border-sm ${active ? 'visible' : 'invisible'}`}
      />
      <span className={active ? 'invisible': ''}>{title}</span>
    </button>
  )
};

export default LoadingButton;