import React, { useState, useEffect } from 'react'
import { TabList, Tab, Widget, Tag, Table, Form } from 'web3uikit'
import { Link } from 'react-router-dom'
//import Proposals from '../sampleProposals'
import './pages.css'
import { useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction } from 'react-moralis'


const Home = () => {
    const [passRate, setPassRate] = useState(0)
    const [totalLP, setTotalLP] = useState(0)
    const [counted, setCounted] = useState(0)
    const [voters, setVoters] = useState(0)
    const { Moralis, isInitialized } = useMoralis()
    const [proposals, setProposals] = useState()
    const Web3Api = useMoralisWeb3Api()
    const [sub, setSub] = useState()
    const contractProcessor = useWeb3ExecuteFunction()

    async function createProposal(newProposal) {
        let options = {
            contractAddress: "0xA05426c529Abdb6c32012a5fEadE2CAE33145387",
            functionName: "createProposal",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "string",
                            name: "_description",
                            type: "string"
                        },
                        {
                            internalType: "address[]",
                            name: "_canVote",
                            type: "address[]"
                        }],
                    name: "createProposal",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function"
                },],
            params: {
                _description: newProposal,
                _canVote: voters,
            },
        }

        await contractProcessor.fetch({
            params: options,
            onSuccess: () => {
                console.log("Proposal Successful")
                setSub(false);
            },
            onError: (error) => {
                alert(error.data.message);
                setSub(false)
            },
        })
    }


    async function getStatus(proposalId) {
        const ProposalCounts = Moralis.Object.extend("ProposalCounts")
        const query = new Moralis.Query(ProposalCounts)
        query.equalTo("uid", proposalId)
        const result = await query.first()
        if (result !== undefined) {
            if (result.attributes.passed) {
                return { color: "green", text: "Passed" }
            } else {
                return { color: "red", text: "Rejected" }
            }
        } else {
            return { color: "blue", text: "Ongoing" }
        }
    }

    useEffect(() => {
        if (isInitialized) {
            async function getProposals() {
                const Proposals = Moralis.Object.extend("Proposals")
                const query = new Moralis.Query(Proposals)
                query.descending("uid_decimal")
                const results = await query.find();
                const table = await Promise.all(
                    results.map(async (e) => [
                        e.attributes.uid,
                        e.attributes.description,
                        <Link to="/proposal" state={{
                            description: e.attributes.description,
                            color: (await getStatus(e.attributes.uid)).color,
                            text: (await getStatus(e.attributes.uid)).text,
                            id: e.attributes.uid,
                            proposer: e.attributes.proposer
                        }}>
                            <Tag color={(await getStatus(e.attributes.uid)).color}
                                text={(await getStatus(e.attributes.uid)).text}
                            />
                        </Link>,
                    ])
                )

                setProposals(table)
                setTotalLP(results.length)
            }

            async function getPassRate() {
                const ProposalCounts = Moralis.Object.extend("ProposalCounts")
                const query = new Moralis.Query(ProposalCounts)
                const results = await query.find()
                let votesUp = 0

                results.forEach((e) => {
                    if (e.attributes.passed) {
                        votesUp++
                    }
                })
                setCounted(results.length)
                setPassRate((votesUp / results.length) * 100)
            }

            const fetchTokenIdOwners = async () => {
                const options = {
                    address: "0x88B48F654c30e99bc2e4A1559b4Dcf1aD93FA656",
                    token_id: "6297462134565687701562644097872457958085077774325948225928934236331156963329",
                    chain: "rinkeby",
                }
                const tokenIdOwners = await Web3Api.token.getTokenIdOwners(options)
                const addresses = tokenIdOwners.result.map((e) => e.owner_of)
                setVoters(addresses)
            }
            fetchTokenIdOwners()
            getProposals()
            getPassRate()
        }
    }, [isInitialized])




    return (
        <>
            <div className='content'>
                <TabList defaultActiveKey={1} tabStyle="bulbUnion">
                    <Tab tabKey={1} tabName="DAO">

                        {proposals && (
                            <div className='tabContent'>
                                Governance Overview
                                <div className='widgets'>
                                    <Widget info={totalLP} title="Proposal Created" style={{ width: "200%" }}>
                                        <div className='extraWidgetInfo'>
                                            <div className='extraTitle'>Pass Rate</div>
                                            <div className='progress'>
                                                <div className='progressPercentage' style={{ width: `${passRate}%` }}>
                                                </div>
                                            </div>
                                        </div>
                                    </Widget>
                                    <Widget info={voters.length} title="Eligible Voters"></Widget>
                                    <Widget info={totalLP - counted} title="Ongoing Proposals"></Widget>
                                </div>


                                Recent Proposals
                                <div className='' style={{ marginTop: "30px" }}>
                                    <Table columnsConfig="10% 70% 20%" data={proposals} header={[
                                        <span>ID</span>,
                                        <span>Description</span>,
                                        <span>Status</span>,
                                    ]} pageSize={5} />
                                </div>
                                <Form
                                    buttonConfig={{
                                        isLoading: sub,
                                        loadingText: "Submitting Proposal",
                                        text: "Submit",
                                        theme: "secondary",
                                    }}
                                    data={[
                                        {
                                            inputWidth: "100%",
                                            name: "New Proposal",
                                            type: "textarea",
                                            validation: {
                                                required: true,
                                            },
                                            value: "",
                                        },
                                    ]}
                                    onSubmit={(e) => {
                                        setSub(true);
                                        createProposal(e.data[0].inputResult);
                                    }}
                                    title="Create a New Proposal"
                                />
                            </div>
                        )}
                    </Tab>

                    <Tab tabKey={2} tabName="Forum">

                    </Tab>
                    <Tab tabKey={3} tabName="Docs">

                    </Tab>
                </TabList>
            </div>
            <div className='voting'> </div>
        </>
    )
}
export default Home