"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, PackageCheck } from "lucide-react";
import { z } from "zod";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Loader,
} from "@acme/ui";

import {
  trackingImportantDetailsSchema,
  trackingMainResponseSchema,
} from "~/lib/trackingHelper";

interface ScanDetail {
  status: string;
  status_date_time: string;
  status_location: string;
  status_remark: string;
}

interface ExpandedGroups {
  [status: string]: boolean;
}

export default function SuccessPage({ params }: { params: { awb: string } }) {
  const [shipmentDetails, setShipmentDetails] =
    useState<z.infer<typeof trackingImportantDetailsSchema>>();

  const {
    data: trackingDetails,
    error: trackingError,
    isLoading: trackingLoading,
  } = useQuery(
    ["getTracking"],
    async () => {
      const req = await fetch(`/api/track?awb=${params.awb}`);
      if (!req.ok) {
        throw "Error Fetching the tracking details";
      }
      const json = await req.json();
      console.log({ json });
      try {
        return trackingMainResponseSchema.parse(json);
      } catch (e) {
        throw "Error fetching the tracking details";
      }
    },
    {
      onSuccess: (data) => {
        // @ts-ignore
        setShipmentDetails(data?.data[params.awb]);
      },
    },
  );

  const [groupedScanDetails, setGroupedScanDetails] = useState<{
    [status: string]: ScanDetail[];
  }>({});

  useEffect(() => {
    console.log({ shipmentDetails });
    if (shipmentDetails) {
      const newGroupedScanDetails: { [status: string]: ScanDetail[] } = {};
      if (Object.keys(groupedScanDetails).length === 0) {
        const newGroupedScanDetails: { [status: string]: ScanDetail[] } = {};

        shipmentDetails.scan_details.forEach((scanDetail) => {
          if (!newGroupedScanDetails[scanDetail.status]) {
            newGroupedScanDetails[scanDetail.status] = [];
          }
          //@ts-ignore
          newGroupedScanDetails[scanDetail.status]?.push(scanDetail);
        });
        console.log(newGroupedScanDetails);
        setGroupedScanDetails(newGroupedScanDetails);
      }
    }
  }, [shipmentDetails]);

  useEffect(() => {
    console.log({ groupedScanDetails });
  }, [groupedScanDetails]);

  const [expandedStatusGroups, setExpandedStatusGroups] = useState<string[]>(
    [],
  );

  // Function to toggle a status group
  const toggleStatusGroup = (status: string) => {
    if (expandedStatusGroups.includes(status)) {
      setExpandedStatusGroups((prevExpandedStatusGroups) =>
        prevExpandedStatusGroups.filter((s) => s !== status),
      );
    } else {
      setExpandedStatusGroups((prevExpandedStatusGroups) => [
        ...prevExpandedStatusGroups,
        status,
      ]);
    }
  };

  return (
    <div
      className={
        "mx-auto flex min-h-screen max-w-lg items-center justify-center overflow-scroll"
      }
    >
      {trackingLoading && (
        <div>
          <Link
            href=""
            className="group mb-5 mt-5 flex space-x-1 rounded-full bg-white/30 px-5 py-2 text-center text-sm text-gray-600 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-lg active:shadow-sm sm:mt-0 md:mt-10"
          >
            <p>
              AWB- <span className={"font-medium"}>{params.awb}</span>
            </p>
          </Link>
          <Loader />
        </div>
      )}
      {!trackingLoading && !trackingError && trackingDetails && (
        <div className={"m-2 w-full p-4 md:m-16"}>
          <div className="mx-auto rounded-lg bg-white p-6 shadow-md">
            <h1 className="mb-4 text-lg font-semibold md:text-2xl">
              Estimated Delivery Date
            </h1>
            <p className="mb-4 text-3xl font-black text-pink-600 md:text-5xl ">
              {shipmentDetails?.expected_delivery_date}
            </p>
            {/* Left Column */}
            <div
              className={
                "flex items-center space-x-4 pt-5  text-sm md:text-base"
              }
            >
              <p className="mb-2 text-gray-600">
                AWB Number:{" "}
                <span className="font-semibold md:p-2">
                  {shipmentDetails?.awb_no}
                </span>
              </p>
              {/* Add other fields as needed */}
            </div>

            <div
              className={"flex items-center space-x-4  text-sm md:text-base"}
            >
              <p className="mb-2 text-gray-600">
                Courier:{" "}
                <span className="p-2 font-semibold">
                  {shipmentDetails?.logistic}
                </span>
              </p>
              {/* Add other fields as needed */}
            </div>

            {/* Other Sections */}
            {/* Add other sections using similar grid structures */}

            <div className="mt-6">
              <h2 className="mb-6 text-xl font-semibold">Latest Status</h2>
              <div className={"flex items-center space-x-4"}>
                <div>
                  <PackageCheck className={"-mt-2 text-pink-600"} />
                </div>
                <div className={"flex w-full items-center  justify-between"}>
                  <button className="mb-2 block font-semibold capitalize text-gray-600">
                    {shipmentDetails?.last_scan_details?.status}
                  </button>
                </div>
              </div>
              <ul className="p-4">
                <li className={"py-2"}>
                  <p className="text-sm font-medium text-gray-600">
                    {shipmentDetails?.last_scan_details?.status_date_time}
                  </p>
                  <p className="text-sm text-gray-500">
                    {shipmentDetails?.last_scan_details?.scan_location}
                  </p>
                  <p className="text-sm text-gray-500">
                    {shipmentDetails?.last_scan_details?.remark}
                  </p>
                </li>
              </ul>
            </div>

            {/* Scan Details Section */}
            <div className="mt-6">
              <h2 className="mb-6 text-xl font-semibold">Scan Details</h2>
              <ul>
                {Object.keys(groupedScanDetails).map((status) => (
                  <li key={status} className="mb-6">
                    <div
                      className={"item -mt-2 flex cursor-pointer space-x-4"}
                      onClick={() => toggleStatusGroup(status)}
                    >
                      <div>
                        <PackageCheck className={"text-pink-600"} />
                      </div>
                      <div
                        className={"flex w-full items-center justify-between"}
                      >
                        <button className="mb-2 block font-semibold capitalize text-gray-600">
                          {status}
                        </button>
                        <ChevronDown
                          className={`-mt-2 mr-5 text-gray-600 ${
                            expandedStatusGroups.includes(status)
                              ? "rotate-180 transform"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                    {expandedStatusGroups.includes(status) && (
                      <ul className="p-4  animate-in fade-in duration-300 ease-in-out">
                        {groupedScanDetails[status]?.map(
                          (scanDetail, index) => (
                            <li key={index} className={"py-2"}>
                              <p className="text-sm font-medium text-gray-600">
                                {scanDetail.status_date_time}
                              </p>
                              <p className="text-sm text-gray-500">
                                {scanDetail.status_location}
                              </p>
                              <p className="text-sm text-gray-500">
                                {scanDetail.status_remark}
                              </p>
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
