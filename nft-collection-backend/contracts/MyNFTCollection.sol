// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import { Base64 } from "./libraries/Base64.sol";

contract MyNFTCollection is ERC721URIStorage {

    // Helps keep track of tokenIds
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    string[] firstWords = ["Big", "Large", "Sizeable", "Substantial", "Considerable", "Great", "Huge", "Immense", "Enormous", "Extensive", "Colossal", "Massive", "Mammoth"];
    string[] secondWords = ["Dawg", "Canine", "Hound", "Mongrel", "Cur", "Pup", "Puppy", "Whelp", "Doggy", "Pooch", "Mutt", "Pupper", "Doggo"];
    string[] thirdWords = ["Rhodium", "Platinum", "Gold", "Ruthenium", "Iridium", "Osmium", "Palladium", "Silver", "Iron", "Nickel", "Lead", "Zinc", "Copper"];

    event NewNFTMinted(address sender, uint256 tokenId);

    constructor() ERC721 ("BigDawgSelects", "BDS") {
        console.log("This here is a NFT contract!");
    }

    // Randomly pick word from array
    function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
        rand = rand % firstWords.length;
        return firstWords[rand];
    }

    function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
        rand = rand % secondWords.length;
        return secondWords[rand];
    }

    function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
        rand = rand % thirdWords.length;
        return thirdWords[rand];
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    // Function for user to receive their NFT
    function makeAnNFT() public {
        // Get current tokenId
        uint256 newItemId = _tokenIds.current();

        string memory first = pickRandomFirstWord(newItemId);
        string memory second = pickRandomSecondWord(newItemId);
        string memory third = pickRandomThirdWord(newItemId);
        string memory combinedWord = string(abi.encodePacked(first, second, third));

        // Concatenate together, close with <text> & <svg> tags
        string memory finalSvg = string(abi.encodePacked(baseSvg, combinedWord, "</text></svg>"));

        // Base64 encode all JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        combinedWord,
                        '", "description": "A highly acclaimed collection of Big Dawg Selects.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        // Like previously, prepend data:application/json;base64, to our data
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("/n--------------------");
        console.log(
            string(
                abi.encodePacked(
                    "https://nftpreview.0xdev.codes/?code=",
                    finalTokenUri
                )
            )
        );
        console.log("--------------------\n");

        // Mints NFT with msg.sender
        _safeMint(msg.sender, newItemId);

        // Sets NFT data
        _setTokenURI(newItemId, finalTokenUri);

        // Increments the counter of total NFTs minted
        _tokenIds.increment();
        console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);

        emit NewNFTMinted(msg.sender, newItemId);
    }
}