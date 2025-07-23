const CrashTest = () => {
    throw new Error("This is a test error to check the boundary!");
    return <div>You will never see this.</div>;
};

export default CrashTest;